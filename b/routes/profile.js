// // backend/routes/profile.js
// const express = require('express');
// const router = express.Router();
// const profileController = require('../controllers/profileController');
// const { verifyToken } = require('../middleware/auth');

// // Квизы, созданные пользователем
// router.get('/created-quizzes/:userId', verifyToken, profileController.getCreatedQuizzes);

// // Квизы в избранном
// // backend/routes/profile.js
// router.get('/favourites/:userId', verifyToken, profileController.getFavouriteQuizzes);
// // В routes/profile.js или аналогичном файле
// router.delete('/delete-multiple', verifyToken, profileController.deleteMultipleQuizzes);



// module.exports = router;
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');
const { User }     = require('../models');

const { getCurrentFuel } = require('../utils/fuel');

const { syncFuel } = require('../utils/fuel');

router.get('/fuel', verifyToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  await syncFuel(user);  // обновит user.fuel и user.fuel_updated_at в БД
  res.json({
    fuel:            user.fuel,
    fuel_updated_at: user.fuel_updated_at
  });
});


// Middleware, чтобы пользователь мог видеть только свои данные
const checkUserMatch = (req, res, next) => {
  if (req.user.id.toString() !== req.params.userId) {
    return res.status(403).json({ error: 'Нет прав для доступа к этим данным' });
  }
  next();
};

router.get('/:userId', verifyToken, checkUserMatch, profileController.getProfile);
router.get('/created-quizzes/:userId', verifyToken, checkUserMatch, profileController.getCreatedQuizzes);
router.get('/favourites/:userId', verifyToken, checkUserMatch, profileController.getFavouriteQuizzes);
router.delete('/delete-multiple/:userId', verifyToken, checkUserMatch, profileController.deleteMultipleQuizzes);
router.delete('/favourites/:quizId', verifyToken, profileController.deleteFavouriteQuiz);
router.delete('/delete-multiple-favourites', verifyToken, profileController.deleteMultipleFavouriteQuizzes);
router.get('/history/:userId', verifyToken, checkUserMatch, profileController.getUserHistory);
router.delete('/history/:userId', verifyToken, checkUserMatch, profileController.clearUserHistory);






module.exports = router;

