// models/QuizProgress.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Quiz = require('./Quiz');
const User = require('./User');

const QuizProgress = sequelize.define('QuizProgress', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  answered_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  correct_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  question_quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_progress',
  timestamps: false,
  underscored: true
});

// Ассоциации
QuizProgress.belongsTo(Quiz, { foreignKey: 'quiz_id' });
QuizProgress.belongsTo(User, { foreignKey: 'user_id' });

module.exports = QuizProgress;