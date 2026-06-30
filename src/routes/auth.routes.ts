import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { loginSchema, registerSchema, passwordSchema, forgotPasswordSchema, verifyCodeSchema, resetPasswordSchema } from '../validators/auth.schema'

const router = Router()

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next))
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next))
router.get('/me', auth, (req, res, next) => authController.me(req, res, next))
router.put('/password', auth, validate(passwordSchema), (req, res, next) => authController.changePassword(req, res, next))
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next))
router.post('/verify-code', validate(verifyCodeSchema), (req, res, next) => authController.verifyCode(req, res, next))
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next))

export default router
