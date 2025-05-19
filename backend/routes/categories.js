const express = require('express');
const router = express.Router();
const { getCategoriesWithQuizzes, getAllCategories } = require('../controllers/quizzesController');
const optionalVerifyToken = require('../middleware/optionalVerifyToken');


router.get('/',    optionalVerifyToken, getCategoriesWithQuizzes);


router.get('/all', optionalVerifyToken, getAllCategories);


module.exports = router;
