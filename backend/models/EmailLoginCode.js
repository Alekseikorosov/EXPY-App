const { DataTypes } = require('sequelize');
const sequelize= require('../config/sequelize');
const User= require('./User');

const EmailLoginCode = sequelize.define('EmailLoginCode', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        references: {
            model: User,
            key: 'id'
        }
    },
    code_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'EmailLoginCode',
    tableName: 'email_login_codes',
    timestamps: false
});

/* ─── ассоциация ─── */
EmailLoginCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// теперь EmailLoginCode.user  →  User
User.hasMany(EmailLoginCode, { foreignKey: 'user_id', as: 'loginCodes' });

module.exports = EmailLoginCode;
