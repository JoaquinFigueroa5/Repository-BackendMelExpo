import { Request, Response, NextFunction } from 'express'
import { statsService } from '../services/stats.service'
import { ok } from '../utils/response'

export class ReportsController {
  async topTools(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await statsService.getTopTools()
      res.json(ok(data))
    } catch (err) {
      next(err)
    }
  }

  async loansByMonth(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await statsService.getLoansByMonth()
      res.json(ok(data))
    } catch (err) {
      next(err)
    }
  }

  async delays(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await statsService.getDelays()
      res.json(ok(data))
    } catch (err) {
      next(err)
    }
  }

  async activeUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await statsService.getActiveUsers()
      res.json(ok(data))
    } catch (err) {
      next(err)
    }
  }
}

export const reportsController = new ReportsController()
