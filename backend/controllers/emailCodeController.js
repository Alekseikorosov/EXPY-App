const crypto= require('crypto');
const jwt= require('jsonwebtoken');
const nodemailer= require('nodemailer');
const { Op } = require('sequelize');
const EmailLoginCode= require('../models/EmailLoginCode');
const User= require('../models/User');
const { randomUUID }  = require('crypto'); 
const RefreshToken   = require('../models/RefreshToken');

const transport = nodemailer.createTransport({
    /** используем тот же способ, что и resetPasswordController **/
    service: 'gmail',
    auth   : {
        user: process.env.EMAIL_USER,   // тот же .env, что уже работает
        pass: process.env.EMAIL_PASS
    }
});

/* 1) Отправить код */
exports.sendEmailCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // 6‑значный цифровой код
    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash  = crypto.createHash('sha256').update(code).digest('hex');

    // сохраняем в БД (10 минут жизни)
    await EmailLoginCode.create({
        user_id   : user.id,
        code_hash : codeHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        is_used   : false
    });

    // письмо
    await transport.sendMail({
        from   : '"EXPY" <no‑reply@expy.com>',
        to     : email,
        subject: 'Your EXPY login code',
        text   : `Your login code: ${code}\nIt is valid for 10 minutes.`
    });

    res.json({ sent: true });
};

/* 2) Проверить код */
// controllers/emailCodeController.js
exports.verifyEmailCode = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
  
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const record = await EmailLoginCode.findOne({
      where: {
        user_id:    user.id,
        code_hash:  codeHash,
        is_used:    false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
  
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
  
    // помечаем код как использованный
    await record.update({ is_used: true });
  
    // генерим токены
    const accessToken  = jwt.sign(
      { id: user.id, email: user.email, role: user.role, twofaVerified: true },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
      const jti = randomUUID();
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d', jwtid: jti }
      );
      const { exp } = jwt.decode(refreshToken);
  
    // сохраняем refreshToken в базу
    await RefreshToken.create({
      token:     refreshToken,
      userId:    user.id,
      jwtid:     jti,
      expiresAt: new Date(exp*1000)
    });
  
    return res.json({ success: true, accessToken, refreshToken });
  };