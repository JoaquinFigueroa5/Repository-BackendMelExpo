import { z } from 'zod'

export const createToolSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  cat: z.string().min(1, 'Categoría requerida'),
  code: z.string().min(1, 'Código requerido'),
  desc: z.string().optional(),
  brand: z.string().optional(),
  location: z.string().min(1, 'Ubicación requerida'),
  totalQty: z.number().int().positive('Cantidad debe ser positiva'),
  available: z.number().int().min(0).optional(),
  image: z.string().optional(),
  maxDays: z.number().int().positive().default(7),
  specs: z.record(z.string()).optional(),
  careers: z.array(z.string()).min(1, 'Al menos una carrera requerida'),
  categoryId: z.number().int().positive().optional(),
})

export const updateToolSchema = createToolSchema.partial()

export const statusSchema = z.object({
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED']),
})

export const toolQuerySchema = z.object({
  cat: z.string().optional(),
  career: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED']).optional(),
})
