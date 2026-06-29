import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  carnet: z.string().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  career: z.string().min(1, 'Carrera requerida'),
  role: z.enum(['STUDENT', 'TEACHER', 'COORDINATOR', 'ADMIN']).default('STUDENT'),
  carnet: z.string().optional(),
  phone: z.string().optional(),
  workshop: z.string().optional(),
})

export const updateUserSchema = createUserSchema.partial()

export const careerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const workshopSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  location: z.string().optional(),
})
