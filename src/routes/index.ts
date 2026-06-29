import { Router } from 'express'
import authRoutes from './auth.routes'
import toolsRoutes from './tools.routes'
import requestsRoutes from './requests.routes'
import loansRoutes from './loans.routes'
import userRoutes from './user.routes'
import adminRoutes from './admin.routes'
import reportsRoutes from './reports.routes'
import notificationsRoutes from './notifications.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/tools', toolsRoutes)
router.use('/requests', requestsRoutes)
router.use('/loans', loansRoutes)
router.use('/user', userRoutes)
router.use('/admin', adminRoutes)
router.use('/reports', reportsRoutes)
router.use('/notifications', notificationsRoutes)

export default router
