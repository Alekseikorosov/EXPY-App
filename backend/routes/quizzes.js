// routes/quizzes.js
const express = require('express');
const router  = express.Router();
const quizzesController = require('../controllers/quizzesController');
const { verifyToken }   = require('../middleware/auth');
const optionalVerifyToken = require('../middleware/optionalVerifyToken');
const checkOwnership    = require('../middleware/checkOwnership');
const uploadCover       = require('../middleware/uploadCover'); // multer.memoryStorage()

// GET /api/quizzes
router.get('/', optionalVerifyToken, quizzesController.getAllQuizzes);

// GET /api/quizzes/:id
router.get('/:id', optionalVerifyToken, quizzesController.getQuizById);

// POST /api/quizzes — с полем cover (файл)
router.post(
    '/',
    verifyToken,
    uploadCover.fields([
      { name: 'cover',         maxCount: 1 },
      { name: 'questionImages', maxCount: 30 }
    ]),
    quizzesController.createQuiz
  );

// PUT /api/quizzes/:id — тоже может обновлять cover
 router.put(
     '/:id',
     verifyToken,
     uploadCover.fields([
       { name: 'cover',         maxCount: 1 },
       { name: 'questionImages', maxCount: 30 }
     ]),
     quizzesController.updateQuiz
   );

// DELETE /api/quizzes/:id
router.delete(
  '/:id',
  verifyToken,
  checkOwnership(async req => {
    const Quiz = require('../models/Quiz');
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) throw new Error('Quiz not found');
    return quiz.creator_id;
  }),
  quizzesController.deleteQuiz
);

module.exports = router;
