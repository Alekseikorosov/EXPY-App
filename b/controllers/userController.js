// const bcrypt = require('bcrypt');
// const User = require('../models/User');
//
// exports.updateUsername = async (req, res) => {
//     const { newUsername } = req.body;
//
//     if (!newUsername) {
//         return res.status(400).json({ message: 'Please provide a new username' });
//     }
//
//     // Валидация формата username
//     const usernameRegex = /^[A-Za-z0-9_.-]{4,13}$/;
//     if (!usernameRegex.test(newUsername)) {
//         return res.status(400).json({
//             message: 'Invalid username format. Only Latin letters, digits, hyphen (-), underscore (_), and period (.) are allowed, and the username must be between 4 and 13 characters long.'
//         });
//     }
//
//     try {
//         // middleware verifyToken уже установил req.user
//         const user = await User.findByPk(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//
//         // Если в модели предусмотрено поле для даты последнего изменения имени,
//         // проверяем, что с последнего изменения прошло не менее 14 дней.
//         if (user.lastUsernameChange) {
//             const now = new Date();
//             const lastChange = new Date(user.lastUsernameChange);
//             const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
//             if (diffDays < 14) {
//                 return res.status(403).json({ message: 'You cannot change username again within 14 days' });
//             }
//         }
//
//         // Проверяем, что новый юзернейм не занят
//         const existingUser = await User.findOne({ where: { username: newUsername } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Username already taken' });
//         }
//
//         // Обновляем юзернейм и, если есть, дату последнего изменения
//         user.username = newUsername;
//         if ('lastUsernameChange' in user) {
//             user.lastUsernameChange = new Date();
//         }
//         await user.save();
//
//         return res.status(200).json({ message: 'Username updated successfully', username: newUsername });
//     } catch (error) {
//         console.error('Error updating username:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };
//
// exports.updateEmail = async (req, res) => {
//     const { newEmail, password } = req.body;
//
//     if (!newEmail || !password) {
//         return res.status(400).json({ message: 'Please provide a new email and your password' });
//     }
//
//     // Валидируем формат email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newEmail)) {
//         return res.status(400).json({ message: 'Invalid email format' });
//     }
//
//     try {
//         // Получаем пользователя по ID из токена
//         const user = await User.findByPk(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//
//         // Проверяем введённый пароль
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Incorrect password' });
//         }
//
//         // Проверяем, что новый email не занят
//         const existingUser = await User.findOne({ where: { email: newEmail } });
//         if (existingUser) {
//             return res.status(409).json({ message: 'Email already taken' });
//         }
//
//         // Если в модели есть поле для даты изменения email (например, lastEmailChange),
//         // можно проверить, что с последнего изменения прошло не менее 30 дней.
//         if (user.lastEmailChange) {
//             const now = new Date();
//             const lastChange = new Date(user.lastEmailChange);
//             const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
//             if (diffDays < 30) {
//                 return res.status(403).json({ message: 'You cannot change your email again within 30 days' });
//             }
//         }
//
//         // Обновляем email (и дату изменения, если такое поле существует)
//         user.email = newEmail;
//         if ('lastEmailChange' in user) {
//             user.lastEmailChange = new Date();
//         }
//         await user.save();
//
//         return res.status(200).json({ message: 'Email updated successfully', email: newEmail });
//     } catch (error) {
//         console.error('Error updating email:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          'id',
          'username',
          'email',
          'telephone',
          'role',
          'last_login',
          'created_at',
          'updated_at',
          'fuel',
          'fuel_updated_at'
        ]
      });
      return res.json(users);
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
  };

exports.updateUsername = async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername) {
        return res.status(400).json({ message: 'Please provide a new username' });
    }

    const usernameRegex = /^[A-Za-z0-9_.-]{4,13}$/;
    if (!usernameRegex.test(newUsername)) {
        return res.status(400).json({
            message: 'Invalid username format. Only Latin letters, digits, hyphen (-), underscore (_), and period (.) are allowed, and the username must be between 4 and 13 characters long.'
        });
    }

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.lastUsernameChange) {
            const now = new Date();
            const lastChange = new Date(user.lastUsernameChange);
            const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
            if (diffDays < 14) {
                return res.status(403).json({ message: 'You cannot change username again within 14 days' });
            }
        }

        const existingUser = await User.findOne({ where: { username: newUsername } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        user.username = newUsername;
        if ('lastUsernameChange' in user) {
            user.lastUsernameChange = new Date();
        }
        await user.save();

        return res.status(200).json({ message: 'Username updated successfully', username: newUsername });
    } catch (error) {
        console.error('Error updating username:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEmail = async (req, res) => {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
        return res.status(400).json({ message: 'Please provide a new email and your password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already taken' });
        }

        if (user.lastEmailChange) {
            const now = new Date();
            const lastChange = new Date(user.lastEmailChange);
            const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
            if (diffDays < 30) {
                return res.status(403).json({ message: 'You cannot change your email again within 30 days' });
            }
        }

        user.email = newEmail;
        if ('lastEmailChange' in user) {
            user.lastEmailChange = new Date();
        }
        await user.save();

        return res.status(200).json({ message: 'Email updated successfully', email: newEmail });
    } catch (error) {
        console.error('Error updating email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Новое правило: новый пароль не должен совпадать с текущим
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password' });
        }

        // Проверка нового пароля по требованиям (регулярное выражение)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'New password does not meet the requirements. It must be at least 8 characters long, contain only Latin letters, at least one special character, at least one digit, and include both uppercase and lowercase letters.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};



