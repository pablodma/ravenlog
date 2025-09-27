import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(requireAuth)

// Listar rangos (público para personal)
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Lista de rangos - En desarrollo'
  })
})

// Crear rango (solo admin)
router.post('/', requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Crear rango - En desarrollo'
  })
})

// Actualizar rango (solo admin)
router.patch('/:id', requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Actualizar rango - En desarrollo'
  })
})

// Eliminar rango (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Eliminar rango - En desarrollo'
  })
})

export { router as ranksRouter }
