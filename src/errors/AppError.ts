export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  static notFound(entity: string) {
    return new AppError(404, 'NOT_FOUND', `${entity} no encontrado`)
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'BAD_REQUEST', message, details)
  }

  static unauthorized(message = 'No autorizado') {
    return new AppError(401, 'UNAUTHORIZED', message)
  }

  static forbidden(message = 'Acceso denegado') {
    return new AppError(403, 'FORBIDDEN', message)
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message)
  }

  static validation(details: unknown) {
    return new AppError(422, 'VALIDATION_ERROR', 'Error de validación', details)
  }
}
