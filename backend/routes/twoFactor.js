const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { setup2fa, verify2fa, generateRecoveryCode, verifyRecoveryCode, get2faStatus, disable2fa } = require('../controllers/twoFactorController');

// Эндпоинт для генерации секрета и QR-кода
router.post('/setup', verifyToken, setup2fa);
// Эндпоинт для проверки кода
router.post('/verify', verifyToken, verify2fa);
router.post('/recovery-code', verifyToken, generateRecoveryCode);

// ВАЖНО: именно этот маршрут для проверки
router.post('/recovery-code/verify', verifyRecoveryCode);

router.get('/status', verifyToken, get2faStatus);
router.post('/disable', verifyToken, disable2fa);

module.exports = router;

