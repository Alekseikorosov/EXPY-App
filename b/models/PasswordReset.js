const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PasswordReset = sequelize.define('PasswordReset', {
  email: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  confirmation_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'password_resets',
  timestamps: false
});

module.exports = PasswordReset;
