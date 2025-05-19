
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
          attributes: ['id', 'title', 'question_quantity', 'cover'],
          include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] }
          ]
        }
      ]
    });
    res.json(attempts);
  } catch (error) {
    console.error('Error retrieving user history:', error);
    res.status(500).json({ error: 'Error while getting history' });
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
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ error: 'Error retrieving profile' });
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
    console.error('Error loading featured quizzes:', error);
    res.status(500).json({ error: 'Database error' });
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
      return res.json({ message: 'Bookmark successfully removed' });
    } else {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return res.status(500).json({ error: 'Error deleting bookmark' });
  }
};

exports.deleteMultipleFavouriteQuizzes = async (req, res) => {
  try {
    // quizIds должен приходить в теле запроса
    const { quizIds } = req.body;
    const userId = req.user.id; // middleware verifyToken должен установить req.user

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds must be a non-empty array' });
    }

    // Удаляем записи из таблицы UserFavorite для данного пользователя и выбранных квизов
    const deletedCount = await UserFavorite.destroy({
      where: {
        user_id: userId,
        quiz_id: quizIds
      }
    });

    return res.json({ message: 'Bookmarks successfully removed', deletedCount });
  } catch (error) {
    console.error('Error when bulk deleting bookmarks:', error);
    return res.status(500).json({ error: 'Error deleting bookmarks' });
  }
};

exports.deleteMultipleQuizzes = async (req, res) => {
  try {
    const { quizIds } = req.body;
    const userId = req.user.id; // убедитесь, что JWT middleware устанавливает req.user

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      return res.status(400).json({ error: 'quizIds must be a non-empty array' });
    }

    // Удаляем только квизы, созданные данным пользователем
    const deletedCount = await Quiz.destroy({
      where: {
        id: quizIds,
        creator_id: userId,
      },
    });

    return res.json({ message: 'Quizzes have been successfully removed.', deletedCount });
  } catch (error) {
    console.error('Error when bulk deleting quizzes:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

