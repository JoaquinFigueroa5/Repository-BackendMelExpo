import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../utils/jwt'
import { AppError } from '../errors/AppError'
import { LoginInput, RegisterInput, UserSafe } from '../types'

function toUserSafe(user: any): UserSafe {
  const { password, ...safe } = user
  return safe
}

export class AuthService {
  async register(data: RegisterInput): Promise<{ token: string; user: UserSafe }> {
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
    return { token, user: toUserSafe(user) }
  }

  async login(data: LoginInput): Promise<{ token: string; user: UserSafe }> {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
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
}

export const authService = new AuthService()
