// // backend/routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const db = require('../config/db');
// const router = express.Router();

// // Функция для генерации access token
// function generateAccessToken(user) {
//   return jwt.sign(
//     { id: user.id, username: user.username, role: user.role },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: '1h' }
//   );
// }

// // Функция для генерации refresh token
// function generateRefreshToken(user) {
//   return jwt.sign(
//     { id: user.id, username: user.username, role: user.role },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: '7d' }
//   );
// }

// // Endpoint для логина
// router.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email и пароль обязательны' });
//   }
  
//   const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       console.error('Ошибка запроса к БД:', err);
//       return res.status(500).json({ error: 'Ошибка базы данных' });
//     }
//     if (results.length === 0) {
//       return res.status(401).json({ error: 'Неверные учетные данные' });
//     }
    
//     const user = results[0];
//     try {
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (!passwordMatch) {
//         return res.status(401).json({ error: 'Неверные учетные данные' });
//       }

//       // Вот здесь мы обновляем поле last_login для пользователя
//       const updateLastLoginQuery = 'UPDATE users SET last_login = NOW() WHERE id = ?';
//       db.query(updateLastLoginQuery, [user.id], (updateErr) => {
//         if (updateErr) {
//           console.error('Ошибка обновления поля last_login:', updateErr);
//           // Не обязательно прерывать процесс, можно просто залогировать ошибку
//         }
//       });

//       // Далее создаём токены
//       const accessToken = generateAccessToken(user);
//       const refreshToken = generateRefreshToken(user);

//       // Возвращаем токены клиенту
//       res.json({ accessToken, refreshToken });
//     } catch (error) {
//       console.error('Ошибка при сравнении паролей:', error);
//       res.status(500).json({ error: 'Внутренняя ошибка сервера' });
//     }
//   });
// });


// router.post('/register', async (req, res) => {
//   const { username, email, telephone, password } = req.body;

//   // Проверка обязательных полей
//   if (!username || !email || !telephone || !password) {
//     return res.status(400).json({ error: 'Поля username, email, telephone и password обязательны' });
//   }

//   // Валидация username: не менее 4 символов, только латиница, цифры, нижнее подчеркивание, точка и тире
//   const usernameRegex = /^(?=.{4,13}$)[a-zA-Z0-9_.-]+$/;
//   if (!usernameRegex.test(username)) {
//     return res.status(400).json({
//       error: 'Недопустимый username. Используйте минимум 4 символа, а также латинские буквы, цифры, нижнее подчеркивание, точку или тире.'
//     });
//   }

//   const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
//   if (!passwordRegex.test(password)) {
//     return res.status(400).json({
//       error: 'Пароль должен быть не короче 8 символов и содержать ' +
//              'строчные, заглавные буквы, цифры и спецсимвол из !@#$%^&*.'
//     });
//   }
//   // Проверка уникальности email
//   const checkEmailQuery = 'SELECT * FROM users WHERE email = ? LIMIT 1';
//   db.query(checkEmailQuery, [email], async (err, emailResults) => {
//     if (err) {
//       console.error('Ошибка запроса к БД:', err);
//       return res.status(500).json({ error: 'Ошибка базы данных' });
//     }
//     if (emailResults.length > 0) {
//       return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
//     }

//     // Проверка уникальности username
//     const checkUsernameQuery = 'SELECT * FROM users WHERE username = ? LIMIT 1';
//     db.query(checkUsernameQuery, [username], async (err, usernameResults) => {
//       if (err) {
//         console.error('Ошибка запроса к БД:', err);
//         return res.status(500).json({ error: 'Ошибка базы данных' });
//       }
//       if (usernameResults.length > 0) {
//         return res.status(400).json({ error: 'Пользователь с таким username уже существует' });
//       }

//       // Проверка уникальности номера телефона
//       const checkTelephoneQuery = 'SELECT * FROM users WHERE telephone = ? LIMIT 1';
//       db.query(checkTelephoneQuery, [telephone], async (err, telephoneResults) => {
//         if (err) {
//           console.error('Ошибка запроса к БД:', err);
//           return res.status(500).json({ error: 'Ошибка базы данных' });
//         }
//         if (telephoneResults.length > 0) {
//           return res.status(400).json({ error: 'Пользователь с таким номером телефона уже существует' });
//         }

//         // Хеширование пароля и создание пользователя
//         try {
//           const saltRounds = 10;
//           const hashedPassword = await bcrypt.hash(password, saltRounds);

//           // Предполагается, что таблица users имеет поля: username, email, telephone, password, role
//           const insertQuery = 'INSERT INTO users (username, email, telephone, password, role) VALUES (?, ?, ?, ?, ?)';
//           const role = 'user';
//           db.query(insertQuery, [username, email, telephone, hashedPassword, role], (err, result) => {
//             if (err) {
//               console.error('Ошибка создания пользователя:', err);
//               return res.status(500).json({ error: 'Ошибка базы данных' });
//             }

//             // Создание пользователя для генерации токенов
//             const newUser = { id: result.insertId, username, role };
//             const accessToken = generateAccessToken(newUser);
//             const refreshToken = generateRefreshToken(newUser);

//             return res.status(201).json({
//               message: 'Пользователь успешно зарегистрирован',
//               accessToken,
//               refreshToken
//             });
//           });
//         } catch (hashError) {
//           console.error('Ошибка хеширования пароля:', hashError);
//           return res.status(500).json({ error: 'Ошибка при хешировании пароля' });
//         }
//       });
//     });
//   });
// });

// // Endpoint для обновления access token через refresh token
// router.post('/token', (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) {
//     return res.status(401).json({ error: 'Refresh token обязателен' });
//   }
  
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userPayload) => {
//     if (err) {
//       return res.status(403).json({ error: 'Неверный или просроченный refresh token' });
//     }
//     // userPayload содержит { id, username, role, iat, exp }
//     // Генерируем новый access token
//     const newAccessToken = jwt.sign(
//       { id: userPayload.id, username: userPayload.username, role: userPayload.role },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: '1h' }
//     );
//     res.json({ accessToken: newAccessToken });
//   });
// });
// module.exports = router;
// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const router = express.Router();
const { randomUUID } = require('crypto');


// function generateAccessToken(user) {
//   return jwt.sign(
//     { id: user.id, username: user.username, role: user.role },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: '1h' }
//   );
// }

// function generateRefreshToken(user) {
//   return jwt.sign(
//     { id: user.id, username: user.username, role: user.role },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: '7d' }
//   );
// }

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
      jwtid: randomUUID(),           
    }
  );
}

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ error: 'Email и пароль обязательны' });

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(401).json({ error: 'Неверные учетные данные' });
    
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch)
//       return res.status(401).json({ error: 'Неверные учетные данные' });

//     await user.update({ last_login: new Date() });

//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     res.json({ accessToken, refreshToken });
//   } catch (error) {
//     console.error('Ошибка при логине:', error);
//     res.status(500).json({ error: 'Внутренняя ошибка сервера' });
//   }
// });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Неверные учетные данные' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Неверные учетные данные' });

  await user.update({ last_login: new Date() });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // сохраняем в БД
  const { exp } = jwt.decode(refreshToken);
  await RefreshToken.create({
    token:     refreshToken,
    userId:    user.id,
    expiresAt: new Date(exp * 1000)
  });

  res.json({ accessToken, refreshToken });
});

// routes/auth.js

// … остальной импорт тот же

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, telephone, password } = req.body;
  if (!username || !email || !telephone || !password) {
    return res
      .status(400)
      .json({ error: 'Поля username, email, telephone и password обязательны' });
  }

  // Валидация username
  const usernameRegex = /^(?=.{4,13}$)[a-zA-Z0-9_.-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error:
        'Недопустимый username. Используйте 4–13 символов: латиница, цифры, ._-',
    });
  }

  // Валидация пароля
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'Пароль: ≥8 символов, строчные/ЗАГЛАВНЫЕ буквы, цифры и !@#$%^&*',
    });
  }

  try {
    // Проверяем, нет ли уже такого email/username/telephone
    const [eUser, uUser, tUser] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { username } }),
      User.findOne({ where: { telephone } }),
    ]);
    if (eUser) return res.status(400).json({ error: 'Email уже занят' });
    if (uUser) return res.status(400).json({ error: 'Username уже занят' });
    if (tUser) return res.status(400).json({ error: 'Телефон уже занят' });

    // Создаём пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      telephone,
      password: hashedPassword,
      role: 'user',
    });

    // Не выдаём сразу токены, только сообщение
    return res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});


// router.post('/token', (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) return res.status(401).json({ error: 'Refresh token обязателен' });

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userPayload) => {
//     if (err) return res.status(403).json({ error: 'Неверный или просроченный refresh token' });
//     const newAccessToken = jwt.sign(
//       { id: userPayload.id, username: userPayload.username, role: userPayload.role },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: '1h' }
//     );
//     res.json({ accessToken: newAccessToken });
//   });
// });

router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token обязателен' });

  // проверяем наличие и срок
  const entry = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!entry || entry.expiresAt < new Date()) {
    return res.status(403).json({ error: 'Неверный или просроченный refresh token' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });
    const newAccessToken = generateAccessToken(payload);
    res.json({ accessToken: newAccessToken });
  });
});

// POST /api/auth/logout — отозвать refresh
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  await RefreshToken.destroy({ where: { token: refreshToken } });
  res.json({ message: 'Logged out' });
});

module.exports = router;
