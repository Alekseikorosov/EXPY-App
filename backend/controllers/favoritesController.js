const Favorite = require('../models/UserFavorite');

exports.checkFavorite = async (req, res) => {
  const userId = req.user.id;
  const quizId = req.query.quizId;
  if (!quizId) {
    return res.status(400).json({ error: 'quizId is required' });
  }
  try {
    const favorite = await Favorite.findOne({ where: { user_id: userId, quiz_id: quizId } });
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error('Error checking favorites:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const quizId = req.query.quizId;
  if (!quizId) {
    return res.status(400).json({ error: 'quizId is required' });
  }
  try {
    await Favorite.create({ user_id: userId, quiz_id: quizId });
    res.json({ message: 'Quiz added to favorites' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.json({ message: 'Allready in favourites' });
    }
    console.error('Error adding to favorites:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const quizId = req.query.quizId;
  if (!quizId) {
    return res.status(400).json({ error: 'quizId is required' });
  }
  try {
    const result = await Favorite.destroy({ where: { user_id: userId, quiz_id: quizId } });
    if (result === 0) {
      return res.status(404).json({ error: 'Was not in favorites' });
    }
    res.json({ message: 'Quiz removed from favorites' });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
