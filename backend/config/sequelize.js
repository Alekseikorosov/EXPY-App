const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URI, {
  logging: false, // отключаем логи, если не нужны
  // Другие параметры, если нужны
});

sequelize.authenticate()
  .then(() => console.log('Подключение к MySQL успешно установлено'))
  .catch((err) => console.error('Ошибка подключения к MySQL:', err));

module.exports = sequelize;
