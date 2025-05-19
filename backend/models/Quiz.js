const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const Category = require('./Category');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  question_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creator_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  cover: {
    type: DataTypes.STRING(500),
    allowNull: false,            
    validate: {
      notEmpty: { msg: 'Cover is required' }
    }
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Ассоциации (если нужно использовать .include в запросах)
Quiz.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Quiz.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });


module.exports = Quiz;
