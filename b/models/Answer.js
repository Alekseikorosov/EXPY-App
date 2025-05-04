const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Question = require('./Question');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  question_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'answers',
  timestamps: false
});



module.exports = Answer;
