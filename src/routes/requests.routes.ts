import { Router } from 'express'
import { requestsController } from '../controllers/requests.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { validate } from '../middleware/validate'
import { createRequestSchema, rejectSchema } from '../validators/request.schema'

const router = Router()

router.get('/', auth, (req, res, next) => requestsController.list(req, res, next))
router.post('/', auth, validate(createRequestSchema), (req, res, next) => requestsController.create(req, res, next))
router.patch('/:id/approve', auth, requireRole('COORDINATOR', 'ADMIN'), (req, res, next) => requestsController.approve(req, res, next))
router.patch('/:id/reject', auth, requireRole('COORDINATOR', 'ADMIN'), validate(rejectSchema), (req, res, next) => requestsController.reject(req, res, next))

export default router
