import { Router } from 'express'
import { requireAuth, requirePersonnelOrAdmin } from '../middleware/auth.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(requireAuth)

// Listar todo el personal
router.get('/', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Lista de personal - En desarrollo'
  })
})

// Obtener un miembro del personal
router.get('/:id', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Detalles de personal - En desarrollo'
  })
})

// Crear nuevo personal
router.post('/', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Crear personal - En desarrollo'
  })
})

// Actualizar personal
router.patch('/:id', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Actualizar personal - En desarrollo'
  })
})

export { router as personnelRouter }
