import { prisma } from '../lib/prisma'
import type { CreateIncidentInput, UpdateIncidentInput } from '../types'
import { AppError } from '../errors/AppError'

class IncidentService {
  async list(userId?: number, role?: string) {
    const where: any = {}
    if (userId && role !== 'ADMIN') where.userId = userId
    return prisma.incident.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        tool: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getById(id: number) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        tool: { select: { id: true, name: true, code: true } },
      },
    })
    if (!incident) throw AppError.notFound('Incidencia')
    return incident
  }

  async create(userId: number, data: CreateIncidentInput) {
    if (data.toolId) {
      const tool = await prisma.tool.findUnique({ where: { id: data.toolId } })
      if (!tool) throw AppError.notFound('Herramienta')
    }
    return prisma.incident.create({
      data: {
        userId,
        toolId: data.toolId || null,
        title: data.title,
        description: data.description,
        severity: data.severity || 'low',
      },
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        tool: { select: { id: true, name: true, code: true } },
      },
    })
  }

  async update(id: number, data: UpdateIncidentInput) {
    const existing = await prisma.incident.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Incidencia')

    const updateData: any = { ...data }
    if (data.status === 'resolved' || data.status === 'closed') {
      updateData.resolvedAt = new Date()
    }

    return prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, career: true } },
        tool: { select: { id: true, name: true, code: true } },
      },
    })
  }

  async delete(id: number) {
    const existing = await prisma.incident.findUnique({ where: { id } })
    if (!existing) throw AppError.notFound('Incidencia')
    await prisma.incident.delete({ where: { id } })
  }

  async getStats() {
    const [open, inProgress, resolved, closed] = await Promise.all([
      prisma.incident.count({ where: { status: 'open' } }),
      prisma.incident.count({ where: { status: 'in_progress' } }),
      prisma.incident.count({ where: { status: 'resolved' } }),
      prisma.incident.count({ where: { status: 'closed' } }),
    ])
    const total = open + inProgress + resolved + closed
    return { total, open, inProgress, resolved, closed }
  }
}

export const incidentService = new IncidentService()
