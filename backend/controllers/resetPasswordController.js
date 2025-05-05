// const nodemailer = require('nodemailer');
// const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt');

// // Создаем пул подключений к базе данных
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'expy_quiz',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Создаем транспорт с использованием Gmail (настройте через .env)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // Проверка конфигурации transporter
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Ошибка в конфигурации nodemailer:', error);
//   } else {
//     console.log('Nodemailer настроен правильно, можно отправлять письма.');
//   }
// });

// // Функция сохранения/обновления 6‑значного кода в таблице password_resets
// async function saveConfirmationCode(email, code) {
//   // Код действителен 15 минут
//   const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   const queryUpdate = 'UPDATE password_resets SET confirmation_code = ?, expires_at = ? WHERE email = ?';
//   const [result] = await pool.query(queryUpdate, [code, expiresAt, email]);
//   if (result.affectedRows === 0) {
//     const queryInsert = 'INSERT INTO password_resets (email, confirmation_code, expires_at) VALUES (?, ?, ?)';
//     await pool.query(queryInsert, [email, code, expiresAt]);
//   }
// }

// // Генерация 6‑значного кода и отправка письма
// async function sendConfirmationCode(recipientEmail) {
//   const code = Math.floor(100000 + Math.random() * 900000).toString();
//   await saveConfirmationCode(recipientEmail, code);

//   const mailOptions = {
//     from: `"My App" <${process.env.EMAIL_USER}>`,
//     to: recipientEmail,
//     subject: 'Код подтверждения для сброса пароля',
//     text: `Ваш код подтверждения: ${code}`,
//     html: `<p>Ваш код подтверждения: <strong>${code}</strong></p>`
//   };

//   await transporter.sendMail(mailOptions);
//   return code;
// }

// // Маршрут для отправки кода (resetpass)
// async function resetPassword(req, res) {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ error: 'Email обязателен' });
//   }

//   // Проверяем, существует ли пользователь
//   try {
//     const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Пользователь с таким email не найден' });
//     }
//   } catch (dbError) {
//     console.error('Ошибка при обращении к базе данных:', dbError);
//     return res.status(500).json({ error: 'Ошибка базы данных' });
//   }

//   try {
//     await sendConfirmationCode(email);
//     res.json({ message: 'Код подтверждения успешно отправлен на вашу почту' });
//   } catch (error) {
//     console.error('Ошибка при отправке письма:', error);
//     res.status(500).json({ error: 'Не удалось отправить письмо с кодом подтверждения' });
//   }
// }

// // Маршрут для обновления пароля с использованием 6‑значного кода
// async function updatePassword(req, res) {
//   const { email, confirmationCode, newPassword } = req.body;

//   if (!email || !confirmationCode || !newPassword) {
//     return res.status(400).json({ error: 'email, confirmationCode и newPassword обязательны' });
//   }

//   try {
//     // Проверяем, есть ли запись в password_resets для данного email
//     const [resetRows] = await pool.query(
//       'SELECT confirmation_code, expires_at FROM password_resets WHERE email = ? LIMIT 1',
//       [email]
//     );
//     if (resetRows.length === 0) {
//       return res.status(400).json({ error: 'Код не запрашивался или истёк' });
//     }
//     const resetEntry = resetRows[0];

//     // Проверяем код и время истечения
//     if (resetEntry.confirmation_code !== confirmationCode) {
//       return res.status(400).json({ error: 'Неверный код подтверждения' });
//     }
//     const now = new Date();
//     const expiresAt = new Date(resetEntry.expires_at);
//     if (now > expiresAt) {
//       return res.status(400).json({ error: 'Время действия кода истекло' });
//     }

//     // Проверяем, не совпадает ли новый пароль со старым
//     const [userRows] = await pool.query('SELECT password FROM users WHERE email = ? LIMIT 1', [email]);
//     if (userRows.length === 0) {
//       return res.status(404).json({ error: 'Пользователь не найден' });
//     }
//     const oldHashedPassword = userRows[0].password;
//     const isSamePassword = await bcrypt.compare(newPassword, oldHashedPassword);
//     if (isSamePassword) {
//       return res.status(400).json({ error: 'Ваш новый пароль не должен совпадать со старым.' });
//     }

//     // Хэшируем новый пароль
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Обновляем пароль пользователя в таблице users
//     const updateUserQuery = 'UPDATE users SET password = ? WHERE email = ?';
//     await pool.query(updateUserQuery, [hashedPassword, email]);

//     // Опционально: удаляем запись из password_resets, чтобы код нельзя было использовать повторно
//     const deleteQuery = 'DELETE FROM password_resets WHERE email = ?';
//     await pool.query(deleteQuery, [email]);

//     return res.json({ message: 'Пароль успешно обновлен!' });
//   } catch (error) {
//     console.error('Ошибка при обновлении пароля:', error);
//     return res.status(500).json({ error: 'Ошибка сервера при обновлении пароля' });
//   }
// }

// // Функция для проверки кода подтверждения (если нужна)
// async function verifyCode(req, res) {
//   const { email, confirmationCode } = req.body;
//   if (!email || !confirmationCode) {
//     return res.status(400).json({ error: 'Email и confirmationCode обязательны' });
//   }
//   try {
//     const [rows] = await pool.query(
//       'SELECT confirmation_code, expires_at FROM password_resets WHERE email = ? LIMIT 1',
//       [email]
//     );
//     if (rows.length === 0) {
//       return res.status(400).json({ error: 'Код не запрашивался или истёк' });
//     }
//     const resetEntry = rows[0];
//     if (resetEntry.confirmation_code !== confirmationCode) {
//       return res.status(400).json({ error: 'Неверный код подтверждения' });
//     }
//     const now = new Date();
//     const expiresAt = new Date(resetEntry.expires_at);
//     if (now > expiresAt) {
//       return res.status(400).json({ error: 'Время действия кода истекло' });
//     }
//     return res.json({ message: 'Код подтвержден' });
//   } catch (error) {
//     console.error('Ошибка проверки кода:', error);
//     return res.status(500).json({ error: 'Ошибка сервера при проверке кода' });
//   }
// }

// module.exports = {
//   resetPassword,
//   updatePassword,
//   verifyCode
// };
// backend/controllers/resetPasswordController.js
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const PasswordReset = require('../models/PasswordReset');
const User = require('../models/User');

// Настройка nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Ошибка конфигурации nodemailer:', error);
  } else {
    console.log('Nodemailer настроен правильно, можно отправлять письма.');
  }
});

// Функция сохранения/обновления 6-значного кода
async function saveConfirmationCode(email, code) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут
  await PasswordReset.upsert({ email, confirmation_code: code, expires_at: expiresAt });
}

// Генерация кода и отправка письма
async function sendConfirmationCode(recipientEmail) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await saveConfirmationCode(recipientEmail, code);
  const mailOptions = {
    from: `"EXPY" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Your confirmation code for password reset',
    text: `Your confirmation code: ${code}`,
    html: `<p>Your verification code: <strong>${code}</strong></p>`
  };
  await transporter.sendMail(mailOptions);
  return code;
}

async function resetPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Пользователь с таким email не найден' });

  try {
    await sendConfirmationCode(email);
    res.json({ message: 'Код подтверждения успешно отправлен на вашу почту' });
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    res.status(500).json({ error: 'Не удалось отправить письмо с кодом подтверждения' });
  }
}

async function updatePassword(req, res) {
  const { email, confirmationCode, newPassword } = req.body;
  if (!email || !confirmationCode || !newPassword) {
    return res.status(400).json({ error: 'email, confirmationCode и newPassword обязательны' });
  }
  try {
    const resetEntry = await PasswordReset.findOne({ where: { email } });
    if (!resetEntry) return res.status(400).json({ error: 'Код не запрашивался или истёк' });
    if (resetEntry.confirmation_code !== confirmationCode) {
      return res.status(400).json({ error: 'Неверный код подтверждения' });
    }
    if (new Date() > resetEntry.expires_at) {
      return res.status(400).json({ error: 'Время действия кода истекло' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Ваш новый пароль не должен совпадать со старым.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    await PasswordReset.destroy({ where: { email } });
    res.json({ message: 'Пароль успешно обновлен!' });
  } catch (error) {
    console.error('Ошибка при обновлении пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении пароля' });
  }
}

async function verifyCode(req, res) {
  const { email, confirmationCode } = req.body;
  if (!email || !confirmationCode) {
    return res.status(400).json({ error: 'Email и confirmationCode обязательны' });
  }
  try {
    const resetEntry = await PasswordReset.findOne({ where: { email } });
    if (!resetEntry) return res.status(400).json({ error: 'Код не запрашивался или истёк' });
    if (resetEntry.confirmation_code !== confirmationCode) {
      return res.status(400).json({ error: 'Неверный код подтверждения' });
    }
    if (new Date() > resetEntry.expires_at) {
      return res.status(400).json({ error: 'Время действия кода истекло' });
    }
    res.json({ message: 'Код подтвержден' });
  } catch (error) {
    console.error('Ошибка проверки кода:', error);
    res.status(500).json({ error: 'Ошибка сервера при проверке кода' });
  }
}

module.exports = {
  resetPassword,
  updatePassword,
  verifyCode
};
