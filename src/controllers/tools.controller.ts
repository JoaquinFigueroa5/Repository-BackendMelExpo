import { Request, Response, NextFunction } from 'express'
import { toolService } from '../services/tool.service'
import { movementService } from '../services/movement.service'
import { ok, created } from '../utils/response'

export class ToolsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tools = await toolService.list({
        cat: req.query.cat as string | undefined,
        career: req.query.career as string | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as any,
        userRole: req.userRole,
      })
      res.json(ok(tools))
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tool = await toolService.getById(id)
      res.json(ok(tool))
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tool = await toolService.create(req.body)
      res.status(201).json(created(tool))
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tool = await toolService.update(id, req.body)
      res.json(ok(tool))
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await toolService.delete(id)
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const tool = await toolService.changeStatus(id, req.body.status)
      res.json(ok(tool))
    } catch (err) {
      next(err)
    }
  }

  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const movements = await movementService.listByTool(id)
      res.json(ok(movements))
    } catch (err) {
      next(err)
    }
  }
}

export const toolsController = new ToolsController()
