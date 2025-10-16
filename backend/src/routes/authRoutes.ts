import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.use(authenticateToken);

router.get('/profile', authController.getProfile);
router.put('/change-password', authController.changePassword);

// Admin only routes
router.get('/librarians', authorizeRoles('admin'), authController.getAllLibrarians);
router.post('/librarians', authorizeRoles('admin'), authController.createLibrarian);
router.put('/librarians/:id', authorizeRoles('admin'), authController.updateLibrarian);

export default router;
