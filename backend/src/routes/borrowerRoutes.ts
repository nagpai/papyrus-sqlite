import express from 'express';
import * as borrowerController from '../controllers/borrowerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', borrowerController.getAllBorrowers);
router.get('/active', borrowerController.getActiveBorrowers);
router.get('/:id', borrowerController.getBorrower);
router.get('/:id/history', borrowerController.getBorrowerWithHistory);
router.post('/', borrowerController.createBorrower);
router.put('/:id', borrowerController.updateBorrower);
router.delete('/:id', borrowerController.deleteBorrower);

export default router;
