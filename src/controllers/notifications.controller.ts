import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { ok } from '../utils/response'

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true'
      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.userId!,
          ...(unreadOnly && { read: false }),
        },
        orderBy: { createdAt: 'desc' },
      })
      res.json(ok(notifications))
    } catch (err) {
      next(err)
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      })
      res.json(ok(notification))
    } catch (err) {
      next(err)
    }
  }
}

export const notificationsController = new NotificationsController()
