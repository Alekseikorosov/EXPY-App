// routes/quizGame.js
const express = require('express');
const router = express.Router();
const quizGameController = require('../controllers/quizGameController');
const optionalVerifyToken = require('../middleware/optionalVerifyToken');

router.post('/start', optionalVerifyToken, quizGameController.startQuiz);
router.post('/answer', optionalVerifyToken, quizGameController.submitAnswer);
router.post('/finish', optionalVerifyToken, quizGameController.finishQuiz);
router.get('/result/:attemptId', optionalVerifyToken, quizGameController.getResult);

// Добавляем маршрут для получения вопросов квиза:
router.get('/:quizId/questions', optionalVerifyToken, quizGameController.getQuestions);
router.post('/cancel', optionalVerifyToken, quizGameController.cancelQuiz);

router.get('/checkActive/:attemptId', quizGameController.checkActive);



module.exports = router;
