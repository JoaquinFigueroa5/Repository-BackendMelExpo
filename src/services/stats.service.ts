import { prisma } from '../lib/prisma'

export class StatsService {
  async getDashboardStats() {
    const [totalTools, available, inUse, maintenance, pendingReqs, activeLoans, totalUsers] =
      await Promise.all([
        prisma.tool.count(),
        prisma.tool.count({ where: { status: 'AVAILABLE' } }),
        prisma.tool.count({ where: { status: 'IN_USE' } }),
        prisma.tool.count({ where: { status: 'MAINTENANCE' } }),
        prisma.request.count({ where: { status: 'PENDING' } }),
        prisma.loan.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count(),
      ])

    return { totalTools, available, inUse, maintenance, pendingReqs, activeLoans, totalUsers }
  }

  async getTopTools(limit: number = 5) {
    const result = await prisma.loan.groupBy({
      by: ['toolId'],
      _count: { toolId: true },
      orderBy: { _count: { toolId: 'desc' } },
      take: limit,
    })

    const tools = await prisma.tool.findMany({
      where: { id: { in: result.map((r) => r.toolId) } },
      select: { id: true, name: true },
    })

    return result.map((r) => ({
      name: tools.find((t) => t.id === r.toolId)?.name ?? 'Desconocida',
      count: r._count.toolId,
    }))
  }

  async getLoansByMonth() {
    const loans = await prisma.loan.findMany({
      select: { loanDate: true },
    })

    const monthMap = new Map<string, number>()
    for (const loan of loans) {
      const key = `${loan.loanDate.getFullYear()}-${loan.loanDate.getMonth() + 1}`
      monthMap.set(key, (monthMap.get(key) || 0) + 1)
    }

    return Array.from(monthMap.entries())
      .map(([key, count]) => {
        const [year, month] = key.split('-').map(Number)
        return { year, month, count }
      })
      .sort((a, b) => a.year - b.year || a.month - b.month)
  }

  async getDelays() {
    const [totalOverdue, totalActive] = await Promise.all([
      prisma.loan.count({ where: { status: 'OVERDUE' } }),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
    ])

    const total = totalOverdue + totalActive
    return {
      totalOverdue,
      totalActive,
      rate: total > 0 ? Math.round((totalOverdue / total) * 100) : 0,
    }
  }

  async getActiveUsers(limit: number = 5) {
    const result = await prisma.loan.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit,
    })

    const users = await prisma.user.findMany({
      where: { id: { in: result.map((r) => r.userId) } },
      select: { id: true, name: true },
    })

    return result.map((r) => ({
      name: users.find((u) => u.id === r.userId)?.name ?? 'Desconocido',
      loanCount: r._count.userId,
    }))
  }
}

export const statsService = new StatsService()
