import express from 'express';
import {
  getTransactions,
  getTransaction,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // all transaction routes require auth

router.route('/')
  .get(getTransactions)
  .post(addTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
