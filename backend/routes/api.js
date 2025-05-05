// backend/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Эндпоинт для получения списка пользователей
router.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Ошибка запроса к базе: ', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(results);
  });
});

module.exports = router;
