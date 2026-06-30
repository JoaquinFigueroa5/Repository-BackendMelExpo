import { Request, Response, NextFunction } from 'express'
import { incidentService } from '../services/incident.service'
import { ok, created } from '../utils/response'

class IncidentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      const role = req.userRole
      const result = await incidentService.list(userId, role)
      res.json(ok(result))
    } catch (err) { next(err) }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await incidentService.getById(Number(req.params.id))
      res.json(ok(result))
    } catch (err) { next(err) }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await incidentService.create(req.userId!, req.body)
      res.status(201).json(created(result))
    } catch (err) { next(err) }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await incidentService.update(Number(req.params.id), req.body)
      res.json(ok(result))
    } catch (err) { next(err) }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await incidentService.delete(Number(req.params.id))
      res.json(ok({ message: 'Incidencia eliminada' }))
    } catch (err) { next(err) }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await incidentService.getStats()
      res.json(ok(stats))
    } catch (err) { next(err) }
  }
}

export default new IncidentController()
