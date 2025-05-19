// models/TwoFactorAuth.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class TwoFactorAuth extends Model {
    static associate(models) {
        TwoFactorAuth.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
}

TwoFactorAuth.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        totp_secret: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Вместо is_enabled добавляем status
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'inactive' // при создании 2FA — 'inactive'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'TwoFactorAuth',
        tableName: 'user_two_factor',
        timestamps: false
    }
);

module.exports = TwoFactorAuth;
