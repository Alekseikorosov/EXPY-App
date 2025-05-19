// routes/user.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const {
  getAllUsers,
  updateUsername,
  updateEmail,
  updatePassword,
  confirmPassword,
  getProfile
} = require('../controllers/userController');

// Для админа: получить всех пользователей
router.get(
  '/',
  verifyToken,
  checkRole('admin'),
  getAllUsers
);

// Существующие эндпоинты для личных настроек
router.put('/username', verifyToken, updateUsername);
router.put('/email',    verifyToken, updateEmail);
router.put('/password', verifyToken, updatePassword);
router.post('/confirm-password', verifyToken, confirmPassword);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
