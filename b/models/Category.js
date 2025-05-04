const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// Модель категории
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'categories',
  timestamps: false
});

// Ассоциация: одна категория может иметь много квизов
Category.associate = models => {
  Category.hasMany(models.Quiz, {
    foreignKey: 'category_id',
    as: 'quizzes'
  });
};

module.exports = Category;
