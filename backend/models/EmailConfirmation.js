// models/EmailConfirmation.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class EmailConfirmation extends Model {}

EmailConfirmation.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'email'                // совпадает
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'username'
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'phoneNumber'         // <— это имя колонки в БД
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password'        // <— мапим camelCase на snake_case
    },
    confirmationCodeHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'confirmationCode'
    },
    codeExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'codeExpires'
    }
}, {
    sequelize,
    modelName: 'EmailConfirmation',
    tableName: 'emailconfirmations',
    timestamps: true
});

module.exports = EmailConfirmation;
