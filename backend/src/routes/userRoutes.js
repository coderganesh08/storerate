import { Router } from 'express';
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idSchema, listQuerySchema, userCreateSchema, userUpdateSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));
router.get('/', validate(listQuerySchema, 'query'), asyncHandler(listUsers));
router.get('/:id', validate(idSchema, 'params'), asyncHandler(getUser));
router.post('/', validate(userCreateSchema), asyncHandler(createUser));
router.patch('/:id', validate(idSchema, 'params'), validate(userUpdateSchema), asyncHandler(updateUser));
router.delete('/:id', validate(idSchema, 'params'), asyncHandler(deleteUser));
export default router;
