const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
const { verifyToken } = require('../middleware/auth');

// Маршруты для настройки двухфакторной аутентификации с использованием JWT
router.post('/setup', verifyToken, twoFactorController.setupTwoFactor);
router.post('/verify', verifyToken, twoFactorController.verifyTwoFactor);
router.post('/disable', verifyToken, twoFactorController.disableTwoFactor);

module.exports = router;
