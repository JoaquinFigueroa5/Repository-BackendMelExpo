import { Router } from 'express'
import { toolsController } from '../controllers/tools.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { validate, validateQuery } from '../middleware/validate'
import { createToolSchema, updateToolSchema, statusSchema, toolQuerySchema } from '../validators/tool.schema'

const router = Router()

router.get('/', validateQuery(toolQuerySchema), (req, res, next) => toolsController.list(req, res, next))
router.get('/:id', (req, res, next) => toolsController.getById(req, res, next))
router.get('/:id/movements', (req, res, next) => toolsController.getMovements(req, res, next))
router.post('/', auth, requireRole('COORDINATOR', 'ADMIN'), validate(createToolSchema), (req, res, next) => toolsController.create(req, res, next))
router.put('/:id', auth, requireRole('COORDINATOR', 'ADMIN'), validate(updateToolSchema), (req, res, next) => toolsController.update(req, res, next))
router.delete('/:id', auth, requireRole('ADMIN'), (req, res, next) => toolsController.delete(req, res, next))
router.patch('/:id/status', auth, requireRole('COORDINATOR', 'ADMIN'), validate(statusSchema), (req, res, next) => toolsController.changeStatus(req, res, next))

export default router
