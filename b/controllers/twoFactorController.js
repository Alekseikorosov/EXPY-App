const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { User, TwoFactorAuth } = require('../models'); // убедитесь, что пути корректны

// Генерация секрета и QR-кода для настройки 2FA
exports.setupTwoFactor = async (req, res) => {
    try {
        // Предполагается, что идентификатор пользователя передается через middleware аутентификации (например, req.user.id)
        const userId = req.user.id;

        // Генерация секрета, можно добавить имя приложения и email пользователя для наглядности
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `MyApp (${req.user.email})`
        });

        // Создаем или обновляем запись TwoFactorAuth для данного пользователя
        const [twoFactor, created] = await TwoFactorAuth.findOrCreate({
            where: { user_id: userId },
            defaults: {
                secret: secret.base32,
                enabled: false
            }
        });

        if (!created) {
            // Если запись уже существует, обновляем секрет и сбрасываем статус
            twoFactor.secret = secret.base32;
            twoFactor.enabled = false;
            await twoFactor.save();
        }

        // Генерация QR-кода на основе otpauth URL, который можно отобразить в приложении аутентификации
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Ошибка генерации QR-кода' });
            }
            // Отправляем клиенту QR-код и секрет (секрет можно не отправлять, если он хранится только на сервере)
            return res.json({ qrCode: data_url, secret: secret.base32 });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка настройки двухфакторной аутентификации' });
    }
};

// Проверка введенного кода из Google Authenticator и активация 2FA
exports.verifyTwoFactor = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        // Находим запись TwoFactorAuth для пользователя
        const twoFactor = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (!twoFactor) {
            return res.status(404).json({ message: 'Двухфакторная аутентификация не настроена' });
        }

        // Верификация кода, с учетом допустимого интервала времени (window)
        const verified = speakeasy.totp.verify({
            secret: twoFactor.secret,
            encoding: 'base32',
            token: token,
            window: 1
        });

        if (verified) {
            // Если проверка успешна, помечаем 2FA как включенную
            twoFactor.enabled = true;
            await twoFactor.save();
            return res.json({ message: 'Двухфакторная аутентификация успешно включена' });
        } else {
            return res.status(400).json({ message: 'Неверный код' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка проверки двухфакторной аутентификации' });
    }
};

// Отключение 2FA с проверкой введенного кода для дополнительной безопасности
exports.disableTwoFactor = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        // Находим запись TwoFactorAuth для пользователя
        const twoFactor = await TwoFactorAuth.findOne({ where: { user_id: userId } });
        if (!twoFactor) {
            return res.status(404).json({ message: 'Двухфакторная аутентификация не настроена' });
        }

        // Проверяем корректность кода перед отключением
        const verified = speakeasy.totp.verify({
            secret: twoFactor.secret,
            encoding: 'base32',
            token: token,
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ message: 'Неверный код' });
        }

        // Отключаем 2FA, можно либо удалить запись, либо обновить флаг
        twoFactor.enabled = false;
        await twoFactor.save();
        return res.json({ message: 'Двухфакторная аутентификация отключена' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка отключения двухфакторной аутентификации' });
    }
};
