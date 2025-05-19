// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const router = express.Router();
const { randomUUID } = require('crypto');


const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const EmailConfirmation = require('../models/EmailConfirmation');
const TwoFactorAuth = require('../models/TwoFactorAuth'); // Модель для 2FA
const speakeasy = require('speakeasy');


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

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth   : { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

/**
+ * Универсальная обёртка отправки писем
+ * @param {string} to       — адрес получателя
+ * @param {string} subject  — тема письма
+ * @param {string} text     — текст письма
+ */
async function sendMail(to, subject, text) {
    return transport.sendMail({
      from: `"EXPY" <${process.env.EMAIL_USER}>`,
      to, subject, text
    });
  }

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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password is required!' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Incorrect credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect credentials' });
    }

    // фиксируем время последнего логина
    await user.update({ last_login: new Date() });

    // проверяем, включена ли у пользователя 2FA
    const twofaRecord = await TwoFactorAuth.findOne({ where: { user_id: user.id } });
    const is2faActive = twofaRecord && twofaRecord.status === 'active';

    if (is2faActive) {
      // если 2FA включена — просим ввести код
      return res.json({
        twofaRequired: true,
        tempUserId: user.id
      });
    } else {
      // иначе сразу выдаём токены
      const accessToken  = generateAccessToken(user, true);
      const refreshToken = generateRefreshToken(user);

      // сохраняем refresh-токен в БД
      const { exp, jti } = jwt.decode(refreshToken);
      await RefreshToken.create({
        token:     refreshToken,
        userId:    user.id,
        jwtid:     jti,
        expiresAt: new Date(exp * 1000)
      });

      return res.json({ accessToken, refreshToken });
    }
  } catch (err) {
    console.error('Error while logging in:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/2fa-login', async (req, res) => {
  const { tempUserId, code } = req.body;
  if (!tempUserId || !code) {
    return res.status(400).json({ error: 'Need tempUserId and 2FA code' });
  }

  try {
    // 1. Находим запись двухфакторки
    const twofaRecord = await TwoFactorAuth.findOne({
      where: { user_id: tempUserId, status: 'active' }
    });
    if (!twofaRecord) {
      return res.status(401).json({ error: '2FA not set up or inactive' });
    }

    // 2. Проверяем TOTP-код
    const verified = speakeasy.totp.verify({
      secret: twofaRecord.totp_secret,
      encoding: 'base32',
      token: code,
      window: 1  // допускаем ±1 шаг
    });

    if (!verified) {
      return res.status(401).json({ error: 'Incorrect 2FA code' });
    }

    // 3. Достаём пользователя (для payload токена и last_login, если нужно)
    const user = await User.findByPk(tempUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 4. Обновляем время последнего логина
    await user.update({ last_login: new Date() });

    // 5. Генерируем токены
    const accessToken  = generateAccessToken(user, true);
    const refreshToken = generateRefreshToken(user);
    const { exp, jti } = jwt.decode(refreshToken);

    // 6. Сохраняем refresh‐токен
    await RefreshToken.create({
      token:     refreshToken,
      userId:    user.id,
      jwtid:     jti,
      expiresAt: new Date(exp * 1000)
    });

    // 7. Отдаём их клиенту
    return res.json({ accessToken, refreshToken });

  } catch (err) {
    console.error('Error with 2fa-login:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// routes/auth.js

// … остальной импорт тот же

// POST /api/auth/register
router.post('/register/start', async (req, res) => {
  try {
    const { username, email, telephone, password } = req.body;

    /* ---------- базовая валидация ---------- */
    if (!username || !email || !telephone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLower = email.toLowerCase();

    /* ---------- 1. дубликаты в таблице Users ---------- */
    const duplUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: emailLower },
          { telephone }
        ]
      }
    });

    if (duplUser) {
      const clash =
        duplUser.username === username   ? 'username'   :
        duplUser.email    === emailLower ? 'email'      :
        'phone number';

      return res.status(409).json({
        message: `A user with this ${clash} is already registered`
      });
    }

    /* ---------- 2. дубликаты в незавершённых регистрациях ---------- */
    const duplPending = await EmailConfirmation.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: emailLower },
          { phoneNumber: telephone }
        ],
        codeExpires: { [Op.gt]: new Date() }    // код ещё действителен
      }
    });

    if (duplPending) {
      return res.status(409).json({
        message:
          'Such data is already used in another unfinished registration. ' +
          'Please check your email or try again later.'
      });
    }

    /* ---------- всё свободно → создаём/обновляем запись ---------- */
    const code        = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);                 // 15 минут
    const passHash    = await bcrypt.hash(password, 10);
    const codeHash    = crypto.createHash('sha256').update(code).digest('hex');

       const [rec] = await EmailConfirmation.upsert(
           {
             username,
             email:        emailLower,
             phoneNumber:  telephone,
             passwordHash: passHash,
             confirmationCodeHash: codeHash,
             codeExpires
           },
           { returning: true }              
         );

            /* отправляем письмо/смс */
    await sendMail(emailLower, 'Confirmation code', `Your code: ${code}`);
    
      // возвращаем ID созданной/обновлённой записи
    return res.json({
      message: 'The code has been sent to your email.',
      confirmationId: rec.id
    });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
  }
});

// 2) POST /api/auth/register/resend-code
router.post('/register/resend-code', async (req, res) => {
  try {
    const { confirmationId } = req.body;
    if (!confirmationId) {
      return res.status(400).json({ message: 'confirmationId is required' });
    }

    const rec = await EmailConfirmation.findByPk(confirmationId);
    if (!rec) {
      return res.status(404).json({ message: 'Confirmation record not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    rec.confirmationCodeHash = codeHash;
    rec.codeExpires = new Date(Date.now() + 60 * 60 * 1000);
    await rec.save();

    await sendMail(rec.email,
      'Your new verification code',
      `Your new verification code is ${code}. It is valid for 60 minutes.`);

    return res.json({ sent: true });
  } catch (err) {
    console.error('resendCode error:', err);
    return res.status(500).json({ error: 'Server error during resend' });
  }
});

// POST /api/auth/register/verify
router.post('/register/verify', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { confirmationId, code } = req.body;

    /* ── базовая проверка ── */
    if (!confirmationId || !code) {
      await t.rollback();
      return res.status(400).json({ message: 'Need confirmationId and code' });
    }
    if (!/^\d{6}$/.test(code)) {
      await t.rollback();
      return res.status(400).json({ message: 'The code must be 6 digits' });
    }

    /* ── ищем запись EmailConfirmation ── */
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const rec  = await EmailConfirmation.findOne({
      where: {
        id: confirmationId,
        confirmationCodeHash: hash,
        codeExpires: { [Op.gt]: new Date() }
      },
      transaction: t
    });

    if (!rec) {
      await t.rollback();
      const stillExists = await EmailConfirmation.findByPk(confirmationId);
      return res.status(400).json({
        message: stillExists
          ? 'Code expired or incorrect'          // запись есть, но код «битый»
          : 'Confirmation request not found.' // запись уже удалена
      });
    }

    /* ── двойная проверка: свободны ли username / email / phone ── */
    const clash = await User.findOne({
      where: {
        [Op.or]: [
          { username : rec.username },
          { email    : rec.email    },
          { telephone: rec.phoneNumber }
        ]
      },
      transaction: t
    });

    if (clash) {
      await rec.destroy({ transaction: t });     // чистим «подвисший» pending
      await t.commit();
      return res.status(409).json({
        message:
          `Unfortunately, the login "${rec.username}" or the specified contacts are already taken.\n` +
          'Please start registration again and select different details.'
      });
    }

    /* ── создаём пользователя ── */
    await User.create({
      username : rec.username,
      email    : rec.email,
      telephone: rec.phoneNumber,
      password : rec.passwordHash,
      role     : 'user',
      emailVerified: true
    }, { transaction: t });

    await rec.destroy({ transaction: t });
    await t.commit();

    return res.json({ success: true, message: 'Registration is complete. You can log in.' });

  } catch (err) {
    await t.rollback();

    /* уникальное ограничение могло сработать прямо на INSERT */
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'This data is already taken. Try another login/email/phone.'
      });
    }

    console.error('verifyRegistration error:', err);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});


router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });

  // проверяем наличие и срок
  const entry = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!entry || entry.expiresAt < new Date()) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
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
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  try {
    // удаляем из таблицы запись с таким же значением token
    const deletedCount = await RefreshToken.destroy({
      where: { token: refreshToken }
    });
    if (!deletedCount) {
      // токен уже был удалён или не существует
      return res.status(404).json({ message: 'Refresh token not found' });
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
