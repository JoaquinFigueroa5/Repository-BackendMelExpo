import { Router } from 'express'
import { loansController } from '../controllers/loans.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { validate } from '../middleware/validate'
import { z } from 'zod'

const router = Router()

const createLoanSchema = z.object({
  requestId: z.number().int().positive().optional(),
  toolId: z.number().int().positive(),
  userId: z.number().int().positive(),
  qty: z.number().int().positive(),
  loanDate: z.string(),
  dueDate: z.string(),
})

const returnSchema = z.object({
  returnDate: z.string(),
})

router.get('/', auth, requireRole('COORDINATOR', 'ADMIN'), (req, res, next) => loansController.list(req, res, next))
router.post('/', auth, requireRole('COORDINATOR', 'ADMIN'), validate(createLoanSchema), (req, res, next) => loansController.create(req, res, next))
router.patch('/:id/return', auth, requireRole('COORDINATOR', 'ADMIN'), validate(returnSchema), (req, res, next) => loansController.return(req, res, next))

export default router
