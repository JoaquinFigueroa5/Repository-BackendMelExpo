import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { updateProfileSchema } from '../validators/user.schema'

const router = Router()

router.get('/loans', auth, (req, res, next) => userController.myLoans(req, res, next))
router.get('/requests', auth, (req, res, next) => userController.myRequests(req, res, next))
router.get('/favorites', auth, (req, res, next) => userController.myFavorites(req, res, next))
router.post('/favorites/:toolId', auth, (req, res, next) => userController.addFavorite(req, res, next))
router.delete('/favorites/:toolId', auth, (req, res, next) => userController.removeFavorite(req, res, next))
router.put('/profile', auth, validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next))

export default router
