import { Router } from 'express';
import { createStore, deleteStore, getStore, listStores, submitRating, updateStore } from '../controllers/storeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idSchema, listQuerySchema, ratingSchema, storeCreateSchema, storeUpdateSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('ADMIN', 'USER'), validate(listQuerySchema, 'query'), asyncHandler(listStores));
router.get('/:id', requireRole('ADMIN', 'USER'), validate(idSchema, 'params'), validate(listQuerySchema, 'query'), asyncHandler(getStore));
router.post('/', requireRole('ADMIN'), validate(storeCreateSchema), asyncHandler(createStore));
router.patch('/:id', requireRole('ADMIN'), validate(idSchema, 'params'), validate(storeUpdateSchema), asyncHandler(updateStore));
router.delete('/:id', requireRole('ADMIN'), validate(idSchema, 'params'), asyncHandler(deleteStore));
router.post('/:id/ratings', requireRole('USER'), validate(idSchema, 'params'), validate(ratingSchema), asyncHandler(submitRating));
router.patch('/:id/ratings', requireRole('USER'), validate(idSchema, 'params'), validate(ratingSchema), asyncHandler(submitRating));
export default router;
