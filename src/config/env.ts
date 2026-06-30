import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  EMAIL_HOST: z.string().default('smtp-relay.brevo.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@rema.edu.gt'),
})

export const env = envSchema.parse(process.env)
