import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '../errors/AppError'
import { fail } from '../utils/response'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.code, err.message, err.details))
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json(fail('DUPLICATE', 'El registro ya existe'))
    if (err.code === 'P2025') return res.status(404).json(fail('NOT_FOUND', 'Registro no encontrado'))
    if (err.code === 'P2003') return res.status(400).json(fail('FK_ERROR', 'Error de referencia'))
  }

  if (err instanceof ZodError) {
    return res.status(422).json(fail('VALIDATION_ERROR', 'Error de validación', err.errors))
  }

  console.error('Unhandled error:', err)
  return res.status(500).json(fail('INTERNAL_ERROR', 'Error interno del servidor'))
}
