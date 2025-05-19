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
    console.error('nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer is configured correctly, you can send emails.');
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
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User with this email not found' });

  try {
    await sendConfirmationCode(email);
    res.json({ message: 'The confirmation code has been successfully sent to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email with verification code' });
  }
}

async function updatePassword(req, res) {
  const { email, confirmationCode, newPassword } = req.body;
  if (!email || !confirmationCode || !newPassword) {
    return res.status(400).json({ error: 'email, confirmationCode and newPassword is required' });
  }
  try {
    const resetEntry = await PasswordReset.findOne({ where: { email } });
    if (!resetEntry) return res.status(400).json({ error: 'Code not requested or expired' });
    if (resetEntry.confirmation_code !== confirmationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (new Date() > resetEntry.expires_at) {
      return res.status(400).json({ error: 'The code has expired.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Your new password must not be the same as your old one.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    await PasswordReset.destroy({ where: { email } });
    res.json({ message: 'Password successful updated!' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error updating password' });
  }
}

async function verifyCode(req, res) {
  const { email, confirmationCode } = req.body;
  if (!email || !confirmationCode) {
    return res.status(400).json({ error: 'Email and confirmationCode is required' });
  }
  try {
    const resetEntry = await PasswordReset.findOne({ where: { email } });
    if (!resetEntry) return res.status(400).json({ error: 'Code not requested or expired' });
    if (resetEntry.confirmation_code !== confirmationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (new Date() > resetEntry.expires_at) {
      return res.status(400).json({ error: 'The code has expired.' });
    }
    res.json({ message: 'Code confirmed' });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ error: 'Server error while checking code' });
  }
}

module.exports = {
  resetPassword,
  updatePassword,
  verifyCode
};
