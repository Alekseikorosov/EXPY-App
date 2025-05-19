// models/UserRecoveryCode.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');  // Путь к вашему конфигу Sequelize
const User = require('./User');                    // Подключаем модель пользователя

const UserRecoveryCode = sequelize.define('UserRecoveryCode', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: User, // Ссылка на модель пользователя
            key: 'id'
        }
    },
    code_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'user_recovery_codes', // Название таблицы в БД
    timestamps: false                 // Отключаем auto createdAt/updatedAt от Sequelize
});

// Ассоциация: связываем с моделью User
UserRecoveryCode.associate = (models) => {
    UserRecoveryCode.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

// helper – compare a plain code with the stored hash
// UserRecoveryCode.prototype.matches = function (plainCode) {
//     const crypto = require('crypto');
//     const hash = crypto.createHash('sha256').update(plainCode).digest('hex');
//     return this.code_hash === hash;
// };
UserRecoveryCode.prototype.matches = function (plainCode) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(plainCode).digest('hex');
    return hash === this.code_hash;
};

module.exports = UserRecoveryCode;
