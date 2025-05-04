// // backend/routes/quizzes.js
// const express = require('express');
// const router = express.Router();
// const quizzesController = require('../controllers/quizzesController');
// const { getQuizById } = require('../controllers/quizzesController');
// const { verifyToken } = require('../middleware/auth');

// // Публичные GET-маршруты — гости могут видеть список квизов и детали
// router.get('/', quizzesController.getAllQuizzes);
// router.get('/:id', quizzesController.getQuizById);

// // Приватные маршруты (создание, обновление, удаление) требуют авторизации
// router.post('/', verifyToken, quizzesController.createQuiz);
// router.put('/:id', verifyToken, quizzesController.updateQuiz);
// router.delete('/:id', verifyToken, quizzesController.deleteQuiz);

// router.get('/quizzes/:id', verifyToken, getQuizById);

// module.exports = router;

const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController');
const { verifyToken } = require('../middleware/auth');
const checkOwnership = require('../middleware/checkOwnership');
const { getQuizById } = require('../controllers/quizzesController');
const optionalVerifyToken = require('../middleware/optionalVerifyToken');
const Quiz = require('../models/Quiz');

// Публичный маршрут для получения списка квизов – доступен гостям и зарегистрированным пользователям
router.get('/', optionalVerifyToken, quizzesController.getAllQuizzes);

// Детали квиза – если токен есть, декодируется, если нет – работает как гость
router.get('/:id', optionalVerifyToken, getQuizById);

// Создание квиза – защищённый маршрут (только авторизованные пользователи)
router.post('/', verifyToken, quizzesController.createQuiz);



// Редактирование квиза – защищённый маршрут
router.put(
  '/:id',
  verifyToken,
  checkOwnership(async (req) => {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new Error('Квиз не найден');
    return quiz.creator_id;
  }),
  quizzesController.updateQuiz
);

// Удаление квиза – защищённый маршрут
router.delete(
  '/:id',
  verifyToken,
  checkOwnership(async (req) => {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new Error('Квиз не найден');
    return quiz.creator_id;
  }),
  quizzesController.deleteQuiz
);

module.exports = router;


