const express = require('express');
const authController = require('../controllers/authController'); // ✅ importar todo el controlador
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);


module.exports = router;
