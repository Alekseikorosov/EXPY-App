require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const sequelize = require('./config/sequelize');

require('./cronJobs');

const optionalVerifyToken = require('./middleware/optionalVerifyToken');
const { verifyToken }     = require('./middleware/auth');
const checkRole           = require('./middleware/checkRole');
const checkOwnership      = require('./middleware/checkOwnership');

const authRoutes      = require('./routes/auth');
const quizRoutes      = require('./routes/quizzes');
const profileRoutes   = require('./routes/profile');
const categoryRoutes  = require('./routes/categories');
const favoritesRoutes = require('./routes/favorites');
const resetPassRouter = require('./routes/resetPassword');
const quizGameRoutes  = require('./routes/quizGame');
const userRoutes      = require('./routes/user');
const twoFactorRoutes = require('./routes/twoFactor');
const adminRoutes = require('./routes/admin');
const emailLoginRoutes= require('./routes/emailLogin');
const errorHandler    = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

sequelize.sync()
  .then(() => console.log('Models synced'))
  .catch(e => console.error(e));

// 1) Сначала «приклеим» опциональную верификацию токена,
//    чтобы в req.user либо данные пользователя, либо undefined
app.use(optionalVerifyToken);

// 2) Auth: логин, регистрация, refresh token и сброс пароля — публичные
app.use('/api/auth', authRoutes);
app.use('/api/auth', resetPassRouter);

app.use('/api/email-login', emailLoginRoutes);

// 3) Категории — публичный endpoint
app.use('/api/categories', categoryRoutes);

// 4) Квизы — публичный GET, остальные операции защищены внутри quizRoutes:
app.use('/api/quizzes', quizRoutes);

// 5) Профиль и история — только для залогиненных
app.use('/api/profile', verifyToken, profileRoutes);

// 6) Избранное — только для залогиненных
app.use('/api/favorites', verifyToken, favoritesRoutes);

// 7) Игра — гостям и юзерам (req.user может быть undefined или заполнен)
app.use('/api/game', quizGameRoutes);

// 8) Двухфакторка — только для залогиненных
app.use('/api/twofactor', twoFactorRoutes);

// 9) Управление пользователями — только админ
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);
// 10) Пинг
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

// старт
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server on ${PORT}`));
