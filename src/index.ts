import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

const app = express()

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

app.use('/api', routes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`REMA server running on http://localhost:${env.PORT}`)
})

export default app
