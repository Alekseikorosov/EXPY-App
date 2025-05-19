const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
// const TwoFactorAuth = require('../models/TwoFactorAuth');
const TwoFactorAuth = require('../models/TwoFactorAuth');
const User= require('../models/User');          // ← добавили
const crypto = require('crypto');
const { randomUUID }   = require('crypto');
const jwt = require('jsonwebtoken');
const UserRecoveryCode = require('../models/UserRecoveryCode');
const RefreshToken     = require('../models/RefreshToken');

exports.setup2fa = async (req, res) => {
    try {
        const userId = req.user.id;
        // Генерируем секрет для TOTP
        const user = await User.findByPk(userId);
        const email = user?.email || 'user';

        const secret = speakeasy.generateSecret({
        length: 20,
        name: `EXPY (${email})`,  
        issuer: 'MyApp'
        });



        // Ищем существующую запись 2FA
        let twofaRecord = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (twofaRecord) {
            twofaRecord.totp_secret = secret.base32;
            twofaRecord.is_enabled = false;
            await twofaRecord.save();
        } else {
            twofaRecord = await TwoFactorAuth.create({
                user_id: userId,
                totp_secret: secret.base32,
                is_enabled: false
            });
        }

        // Генерируем QR-код по otpauth URL
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating QR code' });
            }
            res.json({ qrCode: data_url });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during 2FA setup' });
    }
};

exports.verify2fa = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        const twofaRecord = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (!twofaRecord) {
            return res.status(400).json({ message: '2FA setup not initiated' });
        }

        const verified = speakeasy.totp.verify({
            secret: twofaRecord.totp_secret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (verified) {
            twofaRecord.status = 'active';
            await twofaRecord.save();

            return res.json({ verified: true, message: '2FA successfully activated' });
        } else {
            return res.status(400).json({ verified: false, message: 'Invalid token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during 2FA verification' });
    }
};

exports.disable2fa = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body; // Получаем 6-значный код из req.body

        const twofaRecord = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (!twofaRecord) {
            return res.status(404).json({ message: '2FA not set up' });
        }

        // Проверяем введённый код
        const verified = speakeasy.totp.verify({
            secret: twofaRecord.totp_secret,
            encoding: 'base32',
            token,        // код из body
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        // Если проверка верна – отключаем 2FA
        twofaRecord.status = 'inactive';
        await twofaRecord.save();

        return res.json({ message: '2FA disabled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error disabling 2FA' });
    }
};

exports.get2faStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const twofaRecord = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (!twofaRecord) {
            return res.json({ status: 'none' }); // пользователь не настраивал 2FA
        }
        return res.json({ status: twofaRecord.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching 2FA status' });
    }
};

// Генерация recovery code
exports.generateRecoveryCode = async (req, res) => {
    try {
        const userId = req.user.id;
        // Генерация случайного кода (16 hex-символов, длина 8 байт)
        const code = crypto.randomBytes(8).toString('hex');
        // Хэширование кода
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');

        // Сохраняем в таблицу user_recovery_codes
        await UserRecoveryCode.create({
            user_id: userId,
            code_hash: codeHash,
            is_used: false
        });

        // Возвращаем исходный (не захешированный) код пользователю
        res.json({ code });
    } catch (error) {
        console.error('Error generating recovery code:', error);
        res.status(500).json({ message: 'Error generating recovery code' });
    }
};

exports.verifyRecoveryCode = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and recovery code are required' });
    }
  
    // 1) Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // 2) Проверяем старый recovery-код
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const record = await UserRecoveryCode.findOne({
      where: {
        user_id:   user.id,
        code_hash: codeHash,
        is_used:   false
      }
    });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired recovery code' });
    }
  
    // 3) Помечаем его как использованный
    await record.update({ is_used: true, used_at: new Date() });
  
    // 4) Генерируем и сохраняем новый recovery-код
    const newCode = crypto.randomBytes(8).toString('hex');
    const newHash = crypto.createHash('sha256').update(newCode).digest('hex');
    await UserRecoveryCode.create({
      user_id:   user.id,
      code_hash: newHash,
      is_used:   false
    });
  
    // 5) Генерируем access+refresh токены
    const accessToken  = jwt.sign(
      { id: user.id, email: user.email, role: user.role, twofaVerified: true },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d', jwtid: randomUUID() }
    );
    const { exp, jti } = jwt.decode(refreshToken);
  
    await RefreshToken.create({
      token:     refreshToken,
      userId:    user.id,
      jwtid:     jti,
      expiresAt: new Date(exp * 1000)
    });
  
    // 6) Отдаём новый код вместе с токенами
    return res.json({ 
      success:      true,
      accessToken, 
      refreshToken, 
      newCode 
    });
  };



