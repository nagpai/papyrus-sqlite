import express from 'express';
import * as bookController from '../controllers/bookController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', bookController.getAllBooks);
router.get('/most-borrowed', bookController.getMostBorrowedBooks);
router.get('/genres', bookController.getGenres);
router.get('/:id', bookController.getBook);
router.get('/:id/history', bookController.getBookWithHistory);
router.post('/', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;
