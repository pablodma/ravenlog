import { Router } from 'express'
import { requireAuth, requirePersonnelOrAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// Listar certificaciones
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Lista de certificaciones - En desarrollo'
  })
})

// Crear certificación (admin/personnel)
router.post('/', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Crear certificación - En desarrollo'
  })
})

export { router as certificationsRouter }
