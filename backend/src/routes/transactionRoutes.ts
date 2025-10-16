import express from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/overdue', transactionController.getOverdueTransactions);
router.post('/borrow', transactionController.borrowBook);
router.post('/return', transactionController.returnBook);
router.put('/update-overdue', transactionController.updateOverdueStatuses);
router.get('/:id', transactionController.getTransaction);

export default router;
