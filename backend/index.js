// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const sequelize = require('./config/sequelize'); // наш экземпляр Sequelize

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Синхронизация моделей (при необходимости, можно использовать { alter: true } или { force: false })
// sequelize.sync()
//   .then(() => console.log('Модели синхронизированы'))
//   .catch((error) => console.error('Ошибка синхронизации моделей:', error));

// // Подключение маршрутов
// const authRoutes = require('./routes/auth');
// const quizRoutes = require('./routes/quizzes');
// const profileRoutes = require('./routes/profile');
// const categoryRoutes = require('./routes/categories');
// const favoritesRoutes = require('./routes/favorites');
// const resetPassRouter = require('./routes/resetPassword');
// const quizGameRoutes = require('./routes/quizGame');
// const userRoutes = require('./routes/user');

// const twoFactorRoutes = require('./routes/twoFactor');

// app.use('/api/auth', authRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/favorites', favoritesRoutes);
// app.use('/api/auth', resetPassRouter);
// app.use('/api/game', quizGameRoutes);
// app.use('/api/users', userRoutes);

// app.use('/api/twofactor', twoFactorRoutes);


// app.get('/api/ping', (req, res) => {
//   res.json({ message: 'pong' });
// });

// require('./cronJobs');

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Сервер запущен на порту ${PORT}`);
// });


// backend/index.js
require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const sequelize = require('./config/sequelize')

require('./cronJobs')

const optionalVerifyToken = require('./middleware/optionalVerifyToken')
const { verifyToken }     = require('./middleware/auth')
const checkRole           = require('./middleware/checkRole')
const checkOwnership      = require('./middleware/checkOwnership')

const authRoutes      = require('./routes/auth')
const quizRoutes      = require('./routes/quizzes')
const profileRoutes   = require('./routes/profile')
const categoryRoutes  = require('./routes/categories')
const favoritesRoutes = require('./routes/favorites')
const resetPassRouter = require('./routes/resetPassword')
const quizGameRoutes  = require('./routes/quizGame')
const userRoutes      = require('./routes/user')
const twoFactorRoutes = require('./routes/twoFactor')
const adminRoutes = require('./routes/admin');

const app = express()
app.use(cors())
app.use(express.json())

sequelize.sync()
  .then(() => console.log('Models synced'))
  .catch(e => console.error(e))

// 1) Сначала «приклеим» опциональную верификацию токена,
//    чтобы в req.user либо данные пользователя, либо undefined
app.use(optionalVerifyToken)

// 2) Auth: логин, регистрация, refresh token и сброс пароля — публичные
app.use('/api/auth', authRoutes)
app.use('/api/auth', resetPassRouter)

// 3) Категории — публичный endpoint
app.use('/api/categories', categoryRoutes)

// 4) Квизы — публичный GET, остальные операции защищены внутри quizRoutes:
app.use('/api/quizzes', quizRoutes)

// 5) Профиль и история — только для залогиненных
app.use('/api/profile', verifyToken, profileRoutes)

// 6) Избранное — только для залогиненных
app.use('/api/favorites', verifyToken, favoritesRoutes)

// 7) Игра — гостям и юзерам (req.user может быть undefined или заполнен)
app.use('/api/game', quizGameRoutes)

// 8) Двухфакторка — только для залогиненных
app.use('/api/twofactor', verifyToken, twoFactorRoutes)

// 9) Управление пользователями — только админ
app.use('/api/users', verifyToken, userRoutes)

app.use('/api/admin', adminRoutes);

// для админ-панели

// 10) Пинг
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }))

// старт
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server on ${PORT}`))
