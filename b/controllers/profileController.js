
const Quiz = require('../models/Quiz');
const UserFavorite = require('../models/UserFavorite');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');


// backend/controllers/profileController.js
const Category = require('../models/Category');
// ...

exports.getCreatedQuizzes = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Включаем подгрузку категории
    const quizzes = await Quiz.findAll({
      where: { creator_id: userId },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Ошибка получения созданных квизов:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
};

exports.clearUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedCount = await QuizAttempt.destroy({
      where: { user_id: userId }
    });
    return res.json({ message: 'History cleared', deletedCount });
  } catch (error) {
    console.error('Ошибка при очистке истории:', error);
    return res.status(500).json({ error: 'Ошибка при очистке истории' });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const attempts = await QuizAttempt.findAll({
      where: { user_id: userId },
      order: [['end_time', 'DESC']],
      attributes: [
        'id',
        'quiz_id',
        'final_score',
        'user_results',
        'start_time',
        'end_time'
      ],
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'question_quantity'],
          include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] }
          ]
        }
      ]
    });
    res.json(attempts);
  } catch (error) {
    console.error('Ошибка получения истории пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
};

// Добавьте в profileController.js новый метод
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await require('../models/User').findByPk(userId, {
      attributes: ['id', 'username']
    });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
};



exports.getFavouriteQuizzes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const favorites = await UserFavorite.findAll({ where: { user_id: userId } });
    const quizIds = favorites.map(fav => fav.quiz_id);
    // Подгружаем квизы с информацией о категории и создателе
    const quizzes = await Quiz.findAll({ 
      where: { id: quizIds },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['username'] }
      ]
    });
    res.json(quizzes);
  } catch (error) {
    console.error('Ошибка при загрузке избранных квизов:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
};


// controllers/profileController.js

exports.deleteFavouriteQuiz = async (req, res) => {
  try {
    // Получаем ID пользователя из токена (middleware verifyToken должен установить req.user)
    const userId = req.user.id;
    // Получаем quizId из параметров URL
    const { quizId } = req.params;

    // Удаляем запись из таблицы UserFavorite для данного пользователя и квиза
    const deleted = await UserFavorite.destroy({
      where: { user_id: userId, quiz_id: quizId }
    });

    if (deleted) {
      return res.json({ message: 'Закладка успешно удалена' });
    } else {
      return res.status(404).json({ error: 'Закладка не найдена' });
    }
  } catch (error) {
    console.error('Ошибка при удалении закладки:', error);
    return res.status(500).json({ error: 'Ошибка удаления закладки' });
  }
};

exports.deleteMultipleFavouriteQuizzes = async (req, res) => {
  try {
    // quizIds должен приходить в теле запроса
    const { quizIds } = req.body;
    const userId = req.user.id; // middleware verifyToken должен установить req.user

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds должен быть непустым массивом' });
    }

    // Удаляем записи из таблицы UserFavorite для данного пользователя и выбранных квизов
    const deletedCount = await UserFavorite.destroy({
      where: {
        user_id: userId,
        quiz_id: quizIds
      }
    });

    return res.json({ message: 'Закладки успешно удалены', deletedCount });
  } catch (error) {
    console.error('Ошибка при массовом удалении закладок:', error);
    return res.status(500).json({ error: 'Ошибка удаления закладок' });
  }
};

exports.deleteMultipleQuizzes = async (req, res) => {
  try {
    const { quizIds } = req.body;
    const userId = req.user.id; // убедитесь, что JWT middleware устанавливает req.user

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds должен быть непустым массивом' });
    }

    // Удаляем только квизы, созданные данным пользователем
    const deletedCount = await Quiz.destroy({
      where: {
        id: quizIds,
        creator_id: userId,
      },
    });

    return res.json({ message: 'Квизы успешно удалены', deletedCount });
  } catch (error) {
    console.error('Ошибка при bulk‑удалении квизов:', error);
    return res.status(500).json({ error: 'Ошибка базы данных' });
  }
};

