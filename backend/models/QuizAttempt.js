// models/QuizAttempt.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Готовый инстанс из config/sequelize
const Quiz = require('./Quiz');
const User = require('./User');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'quizzes',  // имя таблицы
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  guest_id: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  user_results: {
  type: DataTypes.TEXT, // вместо JSON, используем TEXT
  allowNull: true,
  get() {
    const rawValue = this.getDataValue('user_results');
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return rawValue;
    }
  },
  set(value) {
    // При сохранении всегда сериализуем значение
    this.setDataValue('user_results', JSON.stringify(value));
  }
},
  final_score: {  
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  result_token: {  
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active','finished','cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'quiz_attempts',
  timestamps: false,
  underscored: true,
});

// Определяем связи (associations) здесь же
QuizAttempt.belongsTo(Quiz, {
  foreignKey: 'quiz_id',
  as: 'quiz'
});
QuizAttempt.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = QuizAttempt;
