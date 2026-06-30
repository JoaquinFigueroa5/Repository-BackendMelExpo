import { Router } from 'express'
import incidentController from '../controllers/incident.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { validate } from '../middleware/validate'
import { createIncidentSchema, updateIncidentSchema } from '../validators/incident.schema'

const router = Router()

router.get('/', auth, (req, res, next) => incidentController.list(req, res, next))
router.get('/stats', auth, (req, res, next) => incidentController.getStats(req, res, next))
router.get('/:id', auth, (req, res, next) => incidentController.getById(req, res, next))
router.post('/', auth, validate(createIncidentSchema), (req, res, next) => incidentController.create(req, res, next))
router.patch('/:id', auth, requireRole('ADMIN'), validate(updateIncidentSchema), (req, res, next) => incidentController.update(req, res, next))
router.delete('/:id', auth, requireRole('ADMIN'), (req, res, next) => incidentController.delete(req, res, next))

export default router
