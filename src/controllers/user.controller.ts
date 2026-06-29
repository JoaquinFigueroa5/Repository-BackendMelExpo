import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { loanService } from '../services/loan.service'
import { requestService } from '../services/request.service'
import { AppError } from '../errors/AppError'
import { ok } from '../utils/response'

export class UserController {
  async myLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loanService.list({
        userId: req.userId!,
        status: req.query.status as any,
      })
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async myRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await requestService.list({
        userId: req.userId!,
        status: req.query.status as any,
      })
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async myFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: req.userId! },
        include: {
          tool: true,
        },
      })
      res.json(ok(favorites.map((f) => f.tool)))
    } catch (err) {
      next(err)
    }
  }

  async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const toolId = Number(req.params.toolId)
      await prisma.favorite.upsert({
        where: { userId_toolId: { userId: req.userId!, toolId } },
        update: {},
        create: { userId: req.userId!, toolId },
      })
      res.json(ok({ message: 'Agregado a favoritos' }))
    } catch (err) {
      next(err)
    }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const toolId = Number(req.params.toolId)
      await prisma.favorite.delete({
        where: { userId_toolId: { userId: req.userId!, toolId } },
      })
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({
        where: { id: req.userId! },
        data: req.body,
      })
      const { password, ...safe } = user
      res.json(ok(safe))
    } catch (err) {
      next(err)
    }
  }
}

export const userController = new UserController()
