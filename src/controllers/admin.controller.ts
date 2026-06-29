import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { statsService } from '../services/stats.service'
import { ok, created } from '../utils/response'

export class AdminController {
  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await statsService.getDashboardStats()
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  // --- Users ---

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const where: any = {}
      if (req.query.role) where.role = req.query.role
      if (req.query.career) where.career = req.query.career

      const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' } })
      const safe = users.map(({ password, ...u }) => u)
      res.json(ok(safe))
    } catch (err) {
      next(err)
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const hashed = await bcrypt.hash(req.body.password, 10)
      const user = await prisma.user.create({
        data: { ...req.body, password: hashed },
      })
      const { password: _, ...safe } = user
      res.status(201).json(created(safe))
    } catch (err) {
      next(err)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const data = { ...req.body }
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      } else {
        delete data.password
      }

      const user = await prisma.user.update({ where: { id }, data })
      const { password: _, ...safe } = user
      res.json(ok(safe))
    } catch (err) {
      next(err)
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await prisma.user.delete({ where: { id } })
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }

  // --- Careers ---

  async listCareers(_req: Request, res: Response, next: NextFunction) {
    try {
      const careers = await prisma.career.findMany({ orderBy: { name: 'asc' } })
      res.json(ok(careers))
    } catch (err) {
      next(err)
    }
  }

  async createCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const career = await prisma.career.create({ data: req.body })
      res.status(201).json(created(career))
    } catch (err) {
      next(err)
    }
  }

  async updateCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const career = await prisma.career.update({ where: { id }, data: req.body })
      res.json(ok(career))
    } catch (err) {
      next(err)
    }
  }

  async deleteCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await prisma.career.delete({ where: { id } })
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }

  // --- Categories ---

  async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
      res.json(ok(categories))
    } catch (err) {
      next(err)
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.create({ data: req.body })
      res.status(201).json(created(category))
    } catch (err) {
      next(err)
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const category = await prisma.category.update({ where: { id }, data: req.body })
      res.json(ok(category))
    } catch (err) {
      next(err)
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await prisma.category.delete({ where: { id } })
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }

  // --- Workshops ---

  async listWorkshops(_req: Request, res: Response, next: NextFunction) {
    try {
      const workshops = await prisma.workshop.findMany({
        include: { careers: true },
        orderBy: { name: 'asc' },
      })
      res.json(ok(workshops))
    } catch (err) {
      next(err)
    }
  }

  async createWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const workshop = await prisma.workshop.create({ data: req.body })
      res.status(201).json(created(workshop))
    } catch (err) {
      next(err)
    }
  }

  async updateWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      const workshop = await prisma.workshop.update({ where: { id }, data: req.body })
      res.json(ok(workshop))
    } catch (err) {
      next(err)
    }
  }

  async deleteWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id)
      await prisma.workshop.delete({ where: { id } })
      res.status(204).json(null)
    } catch (err) {
      next(err)
    }
  }
}

export const adminController = new AdminController()
