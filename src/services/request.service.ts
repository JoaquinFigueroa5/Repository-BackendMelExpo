import { RequestStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'
import { CreateRequestInput } from '../types'
import { toolService } from './tool.service'
import { notificationService } from './notification.service'

export class RequestService {
  async list(filters: { status?: RequestStatus; userId?: number }) {
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.userId) where.userId = filters.userId

    return prisma.request.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        items: {
          include: { tool: { select: { id: true, name: true, code: true, image: true } } },
        },
        review: { include: { coordinator: { select: { id: true, name: true } } } },
      },
      orderBy: { reqDate: 'desc' },
    })
  }

  async create(userId: number, data: CreateRequestInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw AppError.notFound('Usuario')
    if (user.role !== 'STUDENT') throw AppError.forbidden('Solo estudiantes pueden crear solicitudes')

    const tool = await prisma.tool.findUnique({ where: { id: data.toolId } })
    if (!tool) throw AppError.notFound('Herramienta')

    await toolService.validateAvailability(data.toolId, data.qty)
    await toolService.validateCareerAccess(data.toolId, user.career)

    const startDate = new Date(data.startDate)
    const dueDate = new Date(data.endDate)
    const daysDiff = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > tool.maxDays) {
      throw AppError.badRequest(`El período máximo es de ${tool.maxDays} días`)
    }

    const request = await prisma.request.create({
      data: {
        userId,
        reqDate: new Date(),
        notes: data.notes,
        items: {
          create: {
            toolId: data.toolId,
            qty: data.qty,
            startDate,
            dueDate,
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        items: {
          include: { tool: { select: { id: true, name: true, code: true, image: true } } },
        },
      },
    })

    await notificationService.notifyCoordinators(
      'Nueva solicitud de préstamo',
      `El estudiante ${user.name} solicita "${tool.name}" (${data.qty} unidad(es))`,
      '/admin/requests'
    )

    return request
  }

  async approve(requestId: number, coordinatorId: number) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        items: { include: { tool: true } },
        user: true,
      },
    })
    if (!request) throw AppError.notFound('Solicitud')
    if (request.status !== 'PENDING') throw AppError.conflict('La solicitud ya fue procesada')

    for (const item of request.items) {
      await toolService.validateAvailability(item.toolId, item.qty)
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      })

      await tx.requestReview.create({
        data: {
          requestId,
          coordinatorId,
          action: 'APPROVED',
        },
      })

      for (const item of request.items) {
        const loan = await tx.loan.create({
          data: {
            requestId,
            userId: request.userId,
            toolId: item.toolId,
            qty: item.qty,
            loanDate: item.startDate,
            dueDate: item.dueDate,
          },
        })

        await tx.tool.update({
          where: { id: item.toolId },
          data: {
            available: { decrement: item.qty },
          },
        })

        const tool = await tx.tool.findUnique({ where: { id: item.toolId } })
        if (tool && tool.available <= 0) {
          await tx.tool.update({
            where: { id: item.toolId },
            data: { status: 'IN_USE' },
          })
        }

        await tx.movement.create({
          data: {
            loanId: loan.id,
            userId: request.userId,
            toolId: item.toolId,
            type: 'LOAN',
            description: `Préstamo por solicitud #${requestId}`,
          },
        })
      }

      return updated
    })

    await notificationService.notifyUser(
      request.userId,
      'Solicitud aprobada',
      `Tu solicitud #${requestId} fue aprobada. Puedes recoger la(s) herramienta(s) en el taller.`,
      '/account/loans'
    )

    return prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true, career: true } },
        items: { include: { tool: { select: { id: true, name: true, code: true } } } },
        review: { include: { coordinator: { select: { id: true, name: true } } } },
      },
    })
  }

  async reject(requestId: number, coordinatorId: number, comment?: string) {
    const request = await prisma.request.findUnique({ where: { id: requestId } })
    if (!request) throw AppError.notFound('Solicitud')
    if (request.status !== 'PENDING') throw AppError.conflict('La solicitud ya fue procesada')

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      })

      await tx.requestReview.create({
        data: {
          requestId,
          coordinatorId,
          action: 'REJECTED',
          comment,
        },
      })

      return updated
    })

    const msg = comment ? `Motivo: ${comment}` : 'La solicitud no cumple con los requisitos'
    await notificationService.notifyUser(
      request.userId,
      'Solicitud rechazada',
      `Tu solicitud #${requestId} fue rechazada. ${msg}`
    )

    return prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true, career: true } },
        items: { include: { tool: { select: { id: true, name: true, code: true } } } },
        review: { include: { coordinator: { select: { id: true, name: true } } } },
      },
    })
  }
}

export const requestService = new RequestService()
