import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { ok, created } from '../utils/response'

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(created(result))
    } catch (err) {
      next(err)
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!)
      res.json(ok(user))
    } catch (err) {
      next(err)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.userId!, req.body.oldPassword, req.body.newPassword)
      res.json(ok({ message: 'Contraseña actualizada' }))
    } catch (err) {
      next(err)
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async verifyCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyCode(req.body.email, req.body.code)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword)
      res.json(ok(result))
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()
