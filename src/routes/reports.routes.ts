import { Router } from 'express'
import { reportsController } from '../controllers/reports.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'

const router = Router()

router.use(auth, requireRole('ADMIN'))

router.get('/top-tools', (req, res, next) => reportsController.topTools(req, res, next))
router.get('/loans-by-month', (req, res, next) => reportsController.loansByMonth(req, res, next))
router.get('/delays', (req, res, next) => reportsController.delays(req, res, next))
router.get('/active-users', (req, res, next) => reportsController.activeUsers(req, res, next))

export default router
