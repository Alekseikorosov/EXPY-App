const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // экземпляр Sequelize, настроенный для вашего проекта

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    allowNull: false
  },
  fuel: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 160
  },
  fuel_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
    lastUsernameChange: {          
    type: DataTypes.DATE,
    allowNull: true,             
    defaultValue: null
  },
  lastEmailChange: {             
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
