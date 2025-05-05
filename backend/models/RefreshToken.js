const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true      // теперь просто уникальный, но не PK
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RefreshToken;
