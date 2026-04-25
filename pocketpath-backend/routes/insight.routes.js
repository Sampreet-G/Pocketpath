import express from 'express';
import {
  getMonthlyTrend,
  getCategoryBreakdown,
  getBudgets,
  setBudget,
} from '../controllers/insight.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/trend',      getMonthlyTrend);
router.get('/categories', getCategoryBreakdown);
router.route('/budgets').get(getBudgets).post(setBudget);

export default router;
