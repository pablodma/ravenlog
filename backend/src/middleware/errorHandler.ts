import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { statusCode = 500, message } = err

  // Log del error
  console.error(`${req.method} ${req.path} - ${statusCode} - ${message}`)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  // Errores específicos
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Datos de entrada inválidos'
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Token de acceso inválido'
  }

  // Respuesta de error
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
