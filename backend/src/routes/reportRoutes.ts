import express from 'express';
import * as reportController from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Report data endpoints
router.get('/most-borrowed', reportController.getMostBorrowedBooks);
router.get('/active-borrowers', reportController.getActiveBorrowers);
router.get('/overdue', reportController.getOverdueBooks);
router.get('/librarian-activity', reportController.getLibrarianActivity);
router.get('/librarian-stats', reportController.getLibrarianStats);
router.get('/library-stats', reportController.getLibraryStats);

// Export endpoints
router.get('/export/most-borrowed', reportController.exportMostBorrowedBooks);
router.get('/export/overdue', reportController.exportOverdueBooks);
router.get('/export/librarian-activity', reportController.exportLibrarianActivity);

export default router;
