import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import { verifyToken } from '../utils/jwt'

export async function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized()
  }

  try {
    const token = header.split(' ')[1]
    const payload = verifyToken(token)
    req.userId = payload.userId
    req.userRole = payload.role as any
    next()
  } catch {
    throw AppError.unauthorized('Token inválido o expirado')
  }
}
