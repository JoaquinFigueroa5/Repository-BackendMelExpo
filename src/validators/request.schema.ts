import { z } from 'zod'

const requestItemSchema = z.object({
  toolId: z.number().int().positive(),
  qty: z.number().int().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

export const createRequestSchema = z.object({
  toolId: z.number().int().positive('Herramienta requerida').optional(),
  qty: z.number().int().positive('Cantidad debe ser positiva').optional(),
  startDate: z.string().min(1, 'Fecha inicio requerida').optional(),
  endDate: z.string().min(1, 'Fecha fin requerida').optional(),
  notes: z.string().optional(),
  items: z.array(requestItemSchema).min(1, 'Al menos un item requerido').optional(),
}).refine(data => {
  if (data.items) return true
  return data.toolId && data.qty && data.startDate && data.endDate
}, { message: 'Debe enviar toolId/qty/startDate/endDate o items[]' })

export const rejectSchema = z.object({
  comment: z.string().optional(),
})
