// // backend/controllers/favoritesController.js
// const db = require('../config/db');

// /*
//   Предполагается, что в БД есть таблица user_favorites(user_id, quiz_id, added_at).
//   user_id и quiz_id - PK или составной PK, added_at - TIMESTAMP
// */

// // Проверка, есть ли квиз в избранном
// exports.checkFavorite = (req, res) => {
//   const userId = req.user.id;         // из verifyToken
//   const quizId = req.query.quizId;    // ?quizId=...

//   if (!quizId) {
//     return res.status(400).json({ error: 'quizId is required' });
//   }

//   const checkQuery = `
//     SELECT * FROM user_favorites
//     WHERE user_id = ? AND quiz_id = ?
//     LIMIT 1
//   `;
//   db.query(checkQuery, [userId, quizId], (err, results) => {
//     if (err) {
//       console.error('Ошибка проверки избранного:', err);
//       return res.status(500).json({ error: 'Ошибка базы данных' });
//     }
//     const isFavorite = results.length > 0;
//     res.json({ isFavorite });
//   });
// };

// // Добавление в избранное
// exports.addFavorite = (req, res) => {
//   const userId = req.user.id;
//   const quizId = req.query.quizId; // ?quizId=...

//   if (!quizId) {
//     return res.status(400).json({ error: 'quizId is required' });
//   }

//   const insertQuery = `
//     INSERT IGNORE INTO user_favorites (user_id, quiz_id, added_at)
//     VALUES (?, ?, NOW())
//   `;
//   db.query(insertQuery, [userId, quizId], (err, result) => {
//     if (err) {
//       console.error('Ошибка добавления в избранное:', err);
//       return res.status(500).json({ error: 'Ошибка базы данных' });
//     }

//     if (result.affectedRows === 0) {
//       // значит уже было в избранном
//       return res.json({ message: 'Уже в избранном' });
//     }
//     res.json({ message: 'Квиз добавлен в избранное' });
//   });
// };

// // Удаление из избранного
// exports.removeFavorite = (req, res) => {
//   const userId = req.user.id;
//   const quizId = req.query.quizId;

//   if (!quizId) {
//     return res.status(400).json({ error: 'quizId is required' });
//   }

//   const deleteQuery = `
//     DELETE FROM user_favorites
//     WHERE user_id = ? AND quiz_id = ?
//     LIMIT 1
//   `;
//   db.query(deleteQuery, [userId, quizId], (err, result) => {
//     if (err) {
//       console.error('Ошибка удаления из избранного:', err);
//       return res.status(500).json({ error: 'Ошибка базы данных' });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Не было в избранном' });
//     }
//     res.json({ message: 'Квиз удалён из избранного' });
//   });
// };

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
    console.error('Ошибка проверки избранного:', err);
    res.status(500).json({ error: 'Ошибка базы данных' });
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
    res.json({ message: 'Квиз добавлен в избранное' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.json({ message: 'Уже в избранном' });
    }
    console.error('Ошибка добавления в избранное:', err);
    res.status(500).json({ error: 'Ошибка базы данных' });
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
      return res.status(404).json({ error: 'Не было в избранном' });
    }
    res.json({ message: 'Квиз удалён из избранного' });
  } catch (err) {
    console.error('Ошибка удаления из избранного:', err);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
};
