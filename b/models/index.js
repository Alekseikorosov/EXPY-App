// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

// МОДЕЛИ (не фабричные)
const User = require('./User');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Answer = require('./Answer');
const Category = require('./Category');
const QuizAttempt = require('./QuizAttempt');
const UserFavorite = require('./UserFavorite');
const PasswordReset = require('./PasswordReset');
const QuizProgress = require('./QuizProgress');

const TwoFactorAuth = require('./TwoFactorAuth');
const BackupCode = require('./BackupCode');
const RefreshToken = require('./RefreshToken');

// Собираем в db
const db = {
  User,
  Quiz,
  Question,
  Answer,
  Category,
  QuizAttempt,
  QuizProgress,
  UserFavorite,
  PasswordReset,
  TwoFactorAuth,
  BackupCode,
  RefreshToken,
  sequelize,
  Sequelize
};

// Ассоциации, если какие-то модели .associate(...)
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });

Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

User.hasOne(TwoFactorAuth, { foreignKey: 'user_id', as: 'twoFactorAuth' });
TwoFactorAuth.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(BackupCode, { foreignKey: 'user_id', as: 'backupCodes' });
BackupCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Quiz.hasOne(QuizProgress,   { foreignKey: 'quiz_id',    as: 'progress' });
QuizProgress.belongsTo(Quiz,{ foreignKey: 'quiz_id',    as: 'quiz' });

User.hasMany(QuizProgress,  { foreignKey: 'user_id',    as: 'quizProgresses' });
QuizProgress.belongsTo(User,{ foreignKey: 'user_id',    as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
