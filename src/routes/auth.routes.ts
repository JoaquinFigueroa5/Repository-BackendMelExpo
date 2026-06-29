import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { loginSchema, registerSchema, passwordSchema } from '../validators/auth.schema'

const router = Router()

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next))
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next))
router.get('/me', auth, (req, res, next) => authController.me(req, res, next))
router.put('/password', auth, validate(passwordSchema), (req, res, next) => authController.changePassword(req, res, next))

export default router
