import { LoanStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'
import { CreateLoanInput } from '../types'
import { notificationService } from './notification.service'

export class LoanService {
  async list(filters: { status?: LoanStatus; userId?: number; overdue?: boolean }) {
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.userId) where.userId = filters.userId
    if (filters.overdue) {
      where.status = 'ACTIVE'
      where.dueDate = { lt: new Date() }
    }

    return prisma.loan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        tool: { select: { id: true, name: true, code: true, image: true } },
      },
      orderBy: { loanDate: 'desc' },
    })
  }

  async create(data: CreateLoanInput) {
    const tool = await prisma.tool.findUnique({ where: { id: data.toolId } })
    if (!tool) throw AppError.notFound('Herramienta')
    if (tool.available < data.qty) throw AppError.badRequest('Stock insuficiente')

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          requestId: data.requestId,
          userId: data.userId,
          toolId: data.toolId,
          qty: data.qty,
          loanDate: new Date(data.loanDate),
          dueDate: new Date(data.dueDate),
        },
      })

      await tx.tool.update({
        where: { id: data.toolId },
        data: { available: { decrement: data.qty } },
      })

      const updatedTool = await tx.tool.findUnique({ where: { id: data.toolId } })
      if (updatedTool && updatedTool.available <= 0) {
        await tx.tool.update({
          where: { id: data.toolId },
          data: { status: 'IN_USE' },
        })
      }

      await tx.movement.create({
        data: {
          loanId: loan.id,
          userId: data.userId,
          toolId: data.toolId,
          type: 'LOAN',
          description: 'Préstamo directo',
        },
      })

      return loan
    })

    return prisma.loan.findUnique({
      where: { id: result.id },
      include: {
        user: { select: { id: true, name: true } },
        tool: { select: { id: true, name: true, code: true, image: true } },
      },
    })
  }

  async return(loanId: number, returnDate: string) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { tool: true },
    })
    if (!loan) throw AppError.notFound('Préstamo')
    if (loan.status !== 'ACTIVE') throw AppError.conflict('El préstamo ya fue devuelto')

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDate: new Date(returnDate),
          status: 'RETURNED',
        },
      })

      await tx.tool.update({
        where: { id: loan.toolId },
        data: { available: { increment: loan.qty } },
      })

      const tool = await tx.tool.findUnique({ where: { id: loan.toolId } })
      if (tool && tool.available > 0 && tool.status === 'IN_USE') {
        await tx.tool.update({
          where: { id: loan.toolId },
          data: { status: 'AVAILABLE' },
        })
      }

      await tx.movement.create({
        data: {
          loanId,
          userId: loan.userId,
          toolId: loan.toolId,
          type: 'RETURN',
          description: `Devuelto el ${new Date(returnDate).toLocaleDateString()}`,
        },
      })

      return updated
    })

    await notificationService.notifyUser(
      loan.userId,
      'Devolución registrada',
      `Tu devolución de "${loan.tool.name}" fue registrada correctamente.`,
      '/account/loans'
    )

    return prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: { select: { id: true, name: true } },
        tool: { select: { id: true, name: true, code: true, image: true } },
      },
    })
  }

  async checkOverdueLoans(): Promise<number> {
    const overdue = await prisma.loan.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: 'ACTIVE',
      },
      include: { tool: true, user: true },
    })

    for (const loan of overdue) {
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: 'OVERDUE' },
      })

      await prisma.movement.create({
        data: {
          loanId: loan.id,
          toolId: loan.toolId,
          type: 'OVERDUE',
          description: 'Préstamo vencido automáticamente',
        },
      })

      await notificationService.notifyUser(
        loan.userId,
        'Préstamo vencido',
        `"${loan.tool.name}" está atrasada. Regulariza tu situación.`,
        '/account/loans'
      )
    }

    return overdue.length
  }

  async getUpcomingReturns(daysAhead: number = 2) {
    const now = new Date()
    const ahead = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    return prisma.loan.findMany({
      where: {
        dueDate: { gte: now, lte: ahead },
        status: 'ACTIVE',
      },
      include: {
        user: { select: { id: true, name: true } },
        tool: { select: { id: true, name: true } },
      },
    })
  }
}

export const loanService = new LoanService()
