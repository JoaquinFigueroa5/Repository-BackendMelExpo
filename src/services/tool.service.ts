import { Prisma, ToolStatus, UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'
import { ToolFilters, CreateToolInput, UpdateToolInput } from '../types'

export class ToolService {
  async list(filters: ToolFilters & { userRole?: string }) {
    const where: Prisma.ToolWhereInput = {}

    if (filters.cat) where.cat = filters.cat
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ]
    }
    if (filters.career) {
      where.careers = { array_contains: [filters.career] }
    }

    const role = filters.userRole || 'STUDENT'
    if (role === 'STUDENT') {
      where.minRole = 'STUDENT'
    } else if (role === 'TEACHER') {
      where.minRole = { in: ['STUDENT', 'TEACHER'] }
    }

    return prisma.tool.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async getById(id: number) {
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        category: true,
        movements: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
    if (!tool) throw AppError.notFound('Herramienta')
    return tool
  }

  async create(data: CreateToolInput) {
    const existing = await prisma.tool.findUnique({ where: { code: data.code } })
    if (existing) throw AppError.conflict('El código de herramienta ya existe')

    return prisma.tool.create({
      data: {
        name: data.name,
        cat: data.cat,
        code: data.code,
        desc: data.desc,
        brand: data.brand,
        location: data.location,
        totalQty: data.totalQty,
        available: data.available ?? data.totalQty,
        image: data.image,
        maxDays: data.maxDays ?? 7,
        specs: data.specs ?? Prisma.JsonNull,
        careers: data.careers,
        minRole: data.minRole ?? 'STUDENT',
        categoryId: data.categoryId,
      },
      include: { category: true },
    })
  }

  async update(id: number, data: UpdateToolInput) {
    const tool = await prisma.tool.findUnique({ where: { id } })
    if (!tool) throw AppError.notFound('Herramienta')

    if (data.code && data.code !== tool.code) {
      const existing = await prisma.tool.findUnique({ where: { code: data.code } })
      if (existing) throw AppError.conflict('El código de herramienta ya existe')
    }

    return prisma.tool.update({
      where: { id },
      data: {
        ...data,
        specs: data.specs ?? undefined,
        careers: data.careers ?? undefined,
      },
      include: { category: true },
    })
  }

  async delete(id: number): Promise<void> {
    const tool = await prisma.tool.findUnique({ where: { id } })
    if (!tool) throw AppError.notFound('Herramienta')

    const activeLoans = await prisma.loan.count({
      where: { toolId: id, status: 'ACTIVE' },
    })
    if (activeLoans > 0) {
      throw AppError.badRequest('No se puede eliminar: herramienta con préstamos activos')
    }

    await prisma.tool.delete({ where: { id } })
  }

  async changeStatus(id: number, status: ToolStatus) {
    const tool = await prisma.tool.findUnique({ where: { id } })
    if (!tool) throw AppError.notFound('Herramienta')

    if (status === 'MAINTENANCE' && tool.status === 'IN_USE') {
      const activeCount = await prisma.loan.count({
        where: { toolId: id, status: 'ACTIVE' },
      })
      if (activeCount > 0) {
        throw AppError.badRequest('No se puede poner en mantenimiento: hay copias prestadas')
      }
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: { status },
      include: { category: true },
    })

    if (status === 'MAINTENANCE' || status === 'RESERVED') {
      await prisma.movement.create({
        data: {
          toolId: id,
          type: status,
          description: `Estado cambiado a ${status}`,
        },
      })
    }

    return updated
  }

  async validateAvailability(toolId: number, qty: number): Promise<void> {
    const tool = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!tool) throw AppError.notFound('Herramienta')
    if (tool.status === 'MAINTENANCE') throw AppError.badRequest('Herramienta en mantenimiento')
    if (tool.available < qty) throw AppError.badRequest('Stock insuficiente')
  }

  async validateCareerAccess(toolId: number, userCareer: string): Promise<void> {
    const tool = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!tool) throw AppError.notFound('Herramienta')

    const careers = tool.careers as string[]
    if (!careers.includes(userCareer)) {
      throw AppError.badRequest('La herramienta no pertenece a tu carrera')
    }
  }
}

export const toolService = new ToolService()
