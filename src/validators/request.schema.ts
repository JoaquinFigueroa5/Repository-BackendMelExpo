import { z } from 'zod'

export const createRequestSchema = z.object({
  toolId: z.number().int().positive('Herramienta requerida'),
  qty: z.number().int().positive('Cantidad debe ser positiva'),
  startDate: z.string().min(1, 'Fecha inicio requerida'),
  endDate: z.string().min(1, 'Fecha fin requerida'),
  notes: z.string().optional(),
})

export const rejectSchema = z.object({
  comment: z.string().optional(),
})
