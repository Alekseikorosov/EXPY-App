// const mysql = require('mysql2');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'expy_quiz',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Ошибка подключения к БД:', err);
//   } else {
//     console.log('Успешное подключение к базе expy_quiz');
//     connection.release();
//   }
// });

// module.exports = pool;
// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'expy_quiz',      // имя базы
  process.env.DB_USER || 'root',      // пользователь
  process.env.DB_PASS || '',      // пароль
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

module.exports = sequelize;
