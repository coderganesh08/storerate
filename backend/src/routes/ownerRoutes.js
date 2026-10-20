import { Router } from 'express';
import { ratings, summary } from '../controllers/ownerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listQuerySchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, requireRole('STORE_OWNER'));
router.get('/', asyncHandler(summary));
router.get('/ratings', validate(listQuerySchema, 'query'), asyncHandler(ratings));
export default router;
