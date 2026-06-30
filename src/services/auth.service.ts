import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { signToken } from '../utils/jwt'
import { AppError } from '../errors/AppError'
import { LoginInput, RegisterInput, UserSafe } from '../types'

function toUserSafe(user: any): UserSafe {
  const { password, ...safe } = user
  return safe
}

export class AuthService {
  async register(data: RegisterInput): Promise<{ token: string; user: UserSafe; code?: string }> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw AppError.conflict('El correo ya está registrado')

    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        career: data.career,
      },
    })

    const token = signToken({ userId: user.id, role: user.role })

    const code = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await prisma.passwordReset.create({
      data: { email: data.email, code, expiresAt },
    })

    return { token, user: toUserSafe(user), code }
  }

  async login(data: LoginInput): Promise<{ token: string; user: UserSafe }> {
    let user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) {
      user = await prisma.user.findFirst({ where: { name: data.email } })
    }
    if (!user) throw AppError.unauthorized('Credenciales inválidas')

    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) throw AppError.unauthorized('Credenciales inválidas')

    const token = signToken({ userId: user.id, role: user.role })
    return { token, user: toUserSafe(user) }
  }

  async getMe(userId: number): Promise<UserSafe> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw AppError.notFound('Usuario')
    return toUserSafe(user)
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw AppError.notFound('Usuario')

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) throw AppError.badRequest('Contraseña actual incorrecta')

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  }

  async forgotPassword(email: string): Promise<{ message: string; code?: string }> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw AppError.notFound('Usuario con ese correo')

    const code = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.passwordReset.create({
      data: { email, code, expiresAt },
    })

    return { message: 'Código enviado al correo', code }
  }

  async verifyCode(email: string, code: string): Promise<{ valid: boolean }> {
    const reset = await prisma.passwordReset.findFirst({
      where: { email, code, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!reset) throw AppError.badRequest('Código inválido o expirado')
    return { valid: true }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const reset = await prisma.passwordReset.findFirst({
      where: { email, code, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!reset) throw AppError.badRequest('Código inválido o expirado')

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.$transaction([
      prisma.user.update({ where: { email }, data: { password: hashed } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
    ])

    return { message: 'Contraseña actualizada exitosamente' }
  }
}

export const authService = new AuthService()
