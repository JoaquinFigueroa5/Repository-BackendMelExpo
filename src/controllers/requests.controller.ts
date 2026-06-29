import { Request, Response, NextFunction } from 'express'
import { requestService } from '../services/request.service'
import { ok, created } from '../utils/response'

export class RequestsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await requestService.list({
        status: req.query.status as any,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
      })
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await requestService.create(req.userId!, req.body)
      res.status(201).json(created(result))
    } catch (err) {
      next(err)
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const result = await requestService.approve(id, req.userId!)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const result = await requestService.reject(id, req.userId!, req.body.comment)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }
}

export const requestsController = new RequestsController()
