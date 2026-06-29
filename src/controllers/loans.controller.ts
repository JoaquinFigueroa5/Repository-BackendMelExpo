import { Request, Response, NextFunction } from 'express'
import { loanService } from '../services/loan.service'
import { ok, created } from '../utils/response'

export class LoansController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loanService.list({
        status: req.query.status as any,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        overdue: req.query.overdue === 'true',
      })
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loanService.create(req.body)
      res.status(201).json(created(result))
    } catch (err) {
      next(err)
    }
  }

  async return(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const result = await loanService.return(id, req.body.returnDate)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }
}

export const loansController = new LoansController()
