import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { AppError } from '../errors/AppError'

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw AppError.forbidden('No tienes permisos para esta acción')
    }
    next()
  }
}
