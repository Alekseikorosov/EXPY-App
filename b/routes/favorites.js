// // backend/routes/favorites.js
// const express = require('express');
// const router = express.Router();
// const favoritesController = require('../controllers/favoritesController');
// const { verifyToken } = require('../middleware/auth');

// // Проверка, в избранном ли квиз
// router.get('/check', verifyToken, favoritesController.checkFavorite);

// // Добавить в избранное
// router.post('/', verifyToken, favoritesController.addFavorite);

// // Удалить из избранного
// router.delete('/', verifyToken, favoritesController.removeFavorite);

// module.exports = router;
const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { verifyToken } = require('../middleware/auth');

// Проверка, в избранном ли квиз (verifyToken уже устанавливает req.user)
router.get('/check', verifyToken, favoritesController.checkFavorite);

// Добавить в избранное
router.post('/', verifyToken, favoritesController.addFavorite);

// Удалить из избранного
router.delete('/', verifyToken, favoritesController.removeFavorite);

module.exports = router;
