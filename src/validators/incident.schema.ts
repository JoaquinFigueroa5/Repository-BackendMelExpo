import { z } from 'zod'

export const createIncidentSchema = z.object({
  toolId: z.number().int().positive().optional(),
  title: z.string().min(1, 'Título requerido').max(200),
  description: z.string().min(1, 'Descripción requerida').max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
})

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  resolution: z.string().max(2000).optional(),
})
