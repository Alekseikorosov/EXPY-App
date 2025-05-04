const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Quiz = require('./Quiz');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  quiz_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'questions',
  timestamps: false
});



module.exports = Question;
