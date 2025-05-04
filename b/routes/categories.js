// backend/routes/categories.js
const express = require('express');
const router = express.Router();
const { getCategoriesWithQuizzes } = require('../controllers/quizzesController');
// если вам не важна авторизация — опциональный мидлварь можно убрать
const optionalVerifyToken = require('../middleware/optionalVerifyToken');

router.get(
  '/', 
  optionalVerifyToken,          // при желании убрать
  getCategoriesWithQuizzes      // <-- вот он, INNER JOIN: только категорий с квизами
);

module.exports = router;
