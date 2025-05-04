const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const Quiz = require('./Quiz');

const UserFavorite = sequelize.define('UserFavorite', {
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  },
  quiz_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_favorites',
  timestamps: false
});

UserFavorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserFavorite.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

module.exports = UserFavorite;
