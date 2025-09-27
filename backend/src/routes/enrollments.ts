import { Router } from 'express'
import { requireAuth, requirePersonnelOrAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// Listar solicitudes de enlistamiento
router.get('/', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Lista de solicitudes - En desarrollo'
  })
})

// Crear solicitud de enlistamiento
router.post('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Crear solicitud - En desarrollo'
  })
})

// Actualizar estado de solicitud
router.patch('/:id', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Actualizar solicitud - En desarrollo'
  })
})

export { router as enrollmentsRouter }
