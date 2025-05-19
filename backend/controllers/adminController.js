// controllers/adminController.js
const { User, Quiz, Category } = require('../models');


/** Удаление пользователя по ID **/
exports.deleteUser = async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    return res.status(400).json({ error: 'Wrong user ID' });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Запрещаем удалять любых админов
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Administrator account cannot be deleted' });
    }
    // Запрещаем удалить самого себя
    if (req.user.id === userId) {
      return res.status(403).json({ error: "You can't delete your account" });
    }
    await user.destroy();
    res.json({ message: 'User successful deleted!' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** Удаление квиза по ID **/
exports.deleteQuiz = async (req, res) => {
  const quizId = Number(req.params.id);
  if (!quizId) {
    return res.status(400).json({ error: 'Wrong quiz ID ' });
  }
  try {
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await quiz.destroy();
    res.json({ message: 'Quiz successful deleted!' });
  } catch (err) {
    console.error('Error in deleteQuiz:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
