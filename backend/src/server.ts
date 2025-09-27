import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.js'
import { personnelRouter } from './routes/personnel.js'
import { ranksRouter } from './routes/ranks.js'
import { certificationsRouter } from './routes/certifications.js'
import { medalsRouter } from './routes/medals.js'
import { enrollmentsRouter } from './routes/enrollments.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware de seguridad
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Middleware de logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Middleware para parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Rutas de API
app.use('/api/auth', authRouter)
app.use('/api/personnel', personnelRouter)
app.use('/api/ranks', ranksRouter)
app.use('/api/certifications', certificationsRouter)
app.use('/api/medals', medalsRouter)
app.use('/api/enrollments', enrollmentsRouter)

// Middleware de manejo de errores
app.use(errorHandler)

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error)
  process.exit(1)
})
