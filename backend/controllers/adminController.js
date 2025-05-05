// controllers/adminController.js
const { User, Quiz, Category } = require('../models');


/** Удаление пользователя по ID **/
exports.deleteUser = async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    return res.status(400).json({ error: 'Неверный ID пользователя' });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    // Запрещаем удалять любых админов
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Нельзя удалить аккаунт администратора' });
    }
    // Запрещаем удалить самого себя
    if (req.user.id === userId) {
      return res.status(403).json({ error: 'Нельзя удалить свой аккаунт' });
    }
    await user.destroy();
    res.json({ message: 'Пользователь успешно удалён' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/** Удаление квиза по ID **/
exports.deleteQuiz = async (req, res) => {
  const quizId = Number(req.params.id);
  if (!quizId) {
    return res.status(400).json({ error: 'Неверный ID квиза' });
  }
  try {
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Квиз не найден' });
    }
    await quiz.destroy();
    res.json({ message: 'Квиз успешно удалён' });
  } catch (err) {
    console.error('Error in deleteQuiz:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
