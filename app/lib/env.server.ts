import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.string(),
  PULSE_API_KEY: z.string(),
  SESSION_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const serverEnv = serverEnvSchema.parse(process.env)
