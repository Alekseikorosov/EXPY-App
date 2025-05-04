const express = require('express');
const router  = express.Router();
const adminCtrl = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const checkRole       = require('../middleware/checkRole');

// все админские маршруты доступны только залогиненным администраторам
router.use(verifyToken, checkRole('admin'));

// DELETE удалить пользователя
router.delete('/users/:id', adminCtrl.deleteUser);

// DELETE удалить квиз
router.delete('/quizzes/:id', adminCtrl.deleteQuiz);

module.exports = router;