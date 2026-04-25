import express from 'express';
import {
  getReflections,
  addReflection,
  updateReflection,
  deleteReflection,
} from '../controllers/reflect.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getReflections).post(addReflection);
router.route('/:id').put(updateReflection).delete(deleteReflection);

export default router;
