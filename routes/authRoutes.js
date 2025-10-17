// routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

export default router;
