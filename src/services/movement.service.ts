import { prisma } from '../lib/prisma'

export class MovementService {
  async listByTool(toolId: number, limit: number = 10) {
    return prisma.movement.findMany({
      where: { toolId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async listByLoan(loanId: number) {
    return prisma.movement.findMany({
      where: { loanId },
      orderBy: { createdAt: 'asc' },
    })
  }
}

export const movementService = new MovementService()
