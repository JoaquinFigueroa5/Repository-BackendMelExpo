import { Router } from 'express'
import { adminController } from '../controllers/admin.controller'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { validate } from '../middleware/validate'
import { createUserSchema, updateUserSchema, careerSchema, categorySchema, workshopSchema } from '../validators/user.schema'

const router = Router()

router.use(auth, requireRole('COORDINATOR', 'ADMIN'))

router.get('/stats', (req, res, next) => adminController.stats(req, res, next))

router.get('/users', (req, res, next) => adminController.listUsers(req, res, next))
router.post('/users', validate(createUserSchema), (req, res, next) => adminController.createUser(req, res, next))
router.put('/users/:id', validate(updateUserSchema), (req, res, next) => adminController.updateUser(req, res, next))
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next))

router.get('/careers', (req, res, next) => adminController.listCareers(req, res, next))
router.post('/careers', validate(careerSchema), (req, res, next) => adminController.createCareer(req, res, next))
router.put('/careers/:id', validate(careerSchema), (req, res, next) => adminController.updateCareer(req, res, next))
router.delete('/careers/:id', (req, res, next) => adminController.deleteCareer(req, res, next))

router.get('/categories', (req, res, next) => adminController.listCategories(req, res, next))
router.post('/categories', validate(categorySchema), (req, res, next) => adminController.createCategory(req, res, next))
router.put('/categories/:id', validate(categorySchema), (req, res, next) => adminController.updateCategory(req, res, next))
router.delete('/categories/:id', (req, res, next) => adminController.deleteCategory(req, res, next))

router.get('/workshops', (req, res, next) => adminController.listWorkshops(req, res, next))
router.post('/workshops', validate(workshopSchema), (req, res, next) => adminController.createWorkshop(req, res, next))
router.put('/workshops/:id', validate(workshopSchema), (req, res, next) => adminController.updateWorkshop(req, res, next))
router.delete('/workshops/:id', (req, res, next) => adminController.deleteWorkshop(req, res, next))

export default router
