import { Router } from 'express'
import { requireAuth, requirePersonnelOrAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// Listar medallas
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Lista de medallas - En desarrollo'
  })
})

// Crear medalla (admin/personnel)
router.post('/', requirePersonnelOrAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Crear medalla - En desarrollo'
  })
})

export { router as medalsRouter }
