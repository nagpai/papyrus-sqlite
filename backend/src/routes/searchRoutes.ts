import express from 'express';
import * as searchController from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', searchController.universalSearch);
router.get('/books', searchController.searchBooks);
router.get('/borrowers', searchController.searchBorrowers);

export default router;
