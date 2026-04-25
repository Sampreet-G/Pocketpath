import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getProfile).put(updateProfile);
router.put('/password', changePassword);

export default router;
