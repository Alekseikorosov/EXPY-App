const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    secret: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'two_factor_auths',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TwoFactorAuth;
