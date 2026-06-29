import { Router } from 'express'
import { notificationsController } from '../controllers/notifications.controller'
import { auth } from '../middleware/auth'

const router = Router()

router.use(auth)

router.get('/', (req, res, next) => notificationsController.list(req, res, next))
router.patch('/:id/read', (req, res, next) => notificationsController.markAsRead(req, res, next))

export default router
