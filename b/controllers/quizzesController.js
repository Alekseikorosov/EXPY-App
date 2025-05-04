const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const QuizAttempt = require('../models/QuizAttempt');
const QuizProgress = require('../models/QuizProgress');

const { getCurrentFuel, consumeFuel } = require('../utils/fuel');
const FUEL_COST = 20;

// exports.getAllQuizzes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 9;
//     const offset = (page - 1) * limit;
//     const sort = req.query.sort || 'new';

//     let order = [['created_at', 'DESC']];
//     if (sort === 'old') order = [['created_at', 'ASC']];
//     else if (sort === 'random') order = Sequelize.literal('RAND()');

//     const filter = {};
//     if (req.query.categories) {
//       const catIds = req.query.categories.split(',').map(Number).filter(Boolean);
//       if (catIds.length > 0) {
//         filter.category_id = { [Op.in]: catIds };
//       }
//     }

//     const quizzes = await Quiz.findAll({
//       where: filter,
//       include: [
//         { model: User, as: 'creator', attributes: ['username'] },
//         { model: Category, as: 'category', attributes: ['name'] }
//       ],
//       order,
//       offset,
//       limit
//     });

//     return res.json(quizzes);
//   } catch (error) {
//     console.error('Ошибка получения квизов:', error);
//     return res.status(500).json({ error: 'Ошибка базы данных' });
//   }
// };

// exports.getAllQuizzes = async (req, res) => {
//   try {
//     const page   = parseInt(req.query.page)  || 1;
//     const limit  = parseInt(req.query.limit) || 9;
//     const offset = (page - 1) * limit;
//     const sort   = req.query.sort || 'new';

//     // Сортировка
//     let order = [['created_at','DESC']];
//     if (sort === 'old')    order = [['created_at','ASC']];
//     if (sort === 'random') order = Sequelize.literal('RAND()');

//     // Фильтр по категориям
//     const filter = {};
//     if (req.query.categories) {
//       const catIds = req.query.categories
//         .split(',')
//         .map(Number)
//         .filter(Boolean);
//       if (catIds.length) filter.category_id = { [Op.in]: catIds };
//     }

//     // ID пользователя, если залогинен
//     const userId = req.user?.id || null;

//     // Сам запрос
//     const quizzes = await Quiz.findAll({
//       where: filter,
//       include: [
//         { model: User,     as: 'creator',  attributes: ['id','username'] },
//         { model: Category, as: 'category', attributes: ['name'] },
//         // подтягиваем агрегированный прогресс из новой таблицы
//         ...(userId ? [{
//           model: QuizProgress,
//           as: 'progress',
//           where: { user_id: userId },
//           required: false,
//           attributes: ['answered_count','correct_count','question_quantity']
//         }] : [])
//       ],
//       order,
//       offset,
//       limit
//     });

//     // Собираем финальный массив с myProgress
//     const data = quizzes.map(q => {
//       const json = q.toJSON();
//       let myProgress = 0;

//       if (json.progress) {
//         // например, % правильных ответов
//         myProgress = Math.floor(
//           (json.progress.correct_count / json.progress.question_quantity) * 100
//         );
//       }

//       return {
//         id:           json.id,
//         title:        json.title,
//         cover:        json.cover,
//         created_at:   json.created_at,
//         category:     json.category,
//         creator:      json.creator,
//         myProgress,   // 0–100
//         // при необходимости можно вернуть другие поля
//       };
//     });

//     return res.json(data);
//   } catch (error) {
//     console.error('Ошибка получения квизов:', error);
//     return res.status(500).json({ error: 'Ошибка базы данных' });
//   }
// };

exports.getAllQuizzes = async (req, res) => {
  try {
    // --- Пагинация и сортировка ---
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const sort   = req.query.sort || 'new';

    let order = [['created_at', 'DESC']];
    if (sort === 'old')    order = [['created_at', 'ASC']];
    if (sort === 'random') order = Sequelize.literal('RAND()');

    // --- Фильтр по категориям ---
    const filter = {};
    if (req.query.categories) {
      const catIds = req.query.categories
        .split(',')
        .map(Number)
        .filter(id => !isNaN(id));
      if (catIds.length) {
        filter.category_id = { [Op.in]: catIds };
      }
    }

    // --- Подтягиваем прогресс, если пользователь залогинен ---
    const userId = req.user?.id;
    const include = [
      { model: User,     as: 'creator',  attributes: ['id','username'] },
      { model: Category, as: 'category', attributes: ['name'] }
    ];
    if (userId) {
      include.push({
        model: QuizProgress,
        as: 'progress',
        where: { user_id: userId },
        required: false,
        attributes: ['answered_count','correct_count','question_quantity']
      });
    }

    // --- Сам запрос с подсчётом общего числа записей ---
    const { count, rows } = await Quiz.findAndCountAll({
      where: filter,
      include,
      order,
      offset,
      limit
    });

    // --- Формируем результирующий массив ---
    const data = rows.map(q => {
      const json = q.toJSON();
      const myProgress = json.progress
        ? Math.floor((json.progress.correct_count / json.progress.question_quantity) * 100)
        : 0;
      return {
        id:                json.id,
        title:             json.title,
        cover:             json.cover,
        created_at:        json.created_at,
        category:          json.category,
        creator:           json.creator,
        question_quantity: json.question_quantity,  // теперь доступно во фронтенде
        myProgress
      };
    });

    // --- Отдаём данные вместе с метаданными пагинации ---
    res.json({
      total:     count,
      page,
      pageCount: Math.ceil(count / limit),
      quizzes:   data
    });
  } catch (error) {
    console.error('Ошибка получения квизов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

exports.getCategoriesWithQuizzes = async (req, res) => {
    try {
      const categories = await Category.findAll({
        attributes: ['id','name'],
        include: [{
          model: Quiz,
          as: 'quizzes',    // <- обязательно совпадает с as в ассоциации
          attributes: [],
          required: true
        }],
        group: ['Category.id','Category.name']
      });
      return res.json(categories);
    } catch (err) {
      console.error('Ошибка при получении категорий:', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
  };

exports.getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const mode = req.query.mode; // 'edit' или undefined

    // Загружаем квиз
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });
    if (!quiz) {
      return res.status(404).json({ error: 'Квиз не найден' });
    }

    // Если ?mode=edit, значит хотим редактировать
    if (mode === 'edit') {
      // Проверяем, что пользователь авторизован
      if (!req.user) {
        return res.status(401).json({ error: 'Не авторизован (нужен токен) для редактирования' });
      }
      // Проверяем, что либо владелец, либо админ
      if (req.user.role !== 'admin' && quiz.creator_id !== req.user.id) {
        return res.status(403).json({ error: 'Нет прав на редактирование этого квиза' });
      }
    }

    // Загружаем вопросы
    const questions = await Question.findAll({ where: { quiz_id: quizId } });
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await Answer.findAll({ where: { question_id: q.id } });
        return {
          question_id: q.id,
          question_text: q.question_text,
          question_image: q.question_image,
          answers
        };
      })
    );

    // Возвращаем данные
    return res.json({ ...quiz.toJSON(), questions: questionsWithAnswers });
  } catch (error) {
    console.error('Ошибка получения квиза:', error);
    return res.status(500).json({ error: 'Ошибка базы данных' });
  }
};

exports.createQuiz = async (req, res) => {
  const { title, cover, category_id, questions } = req.body;
  const creatorId = req.user.id;
  const userRole = req.user.role;
  
  
  if (!title || !cover || !category_id || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'title, cover, category and questions are required' });
  }
  if (questions.length < 5 || questions.length > 30) {
    return res.status(400).json({ error: 'The number of questions should be from 5 to 30' });
  }
  for (const q of questions) {
    if (!Array.isArray(q.answers) || q.answers.length !== 4) {
      return res.status(400).json({ error: 'Each question must have exactly 4 answers.' });
    }
    const correctCount = q.answers.reduce((acc, ans) => acc + (ans.is_correct ? 1 : 0), 0);
    if (correctCount < 1 || correctCount > 2) {
      return res.status(400).json({ error: 'Each question must have 1 to 2 correct answers.' });
    }
  }
  const trx = await sequelize.transaction();
  try {
    // ===== Проверка и списание топлива (только для role 'user')
    // if (userRole === 'user') {
      // ===== Проверка и списание топлива (для всех, кроме админа)
      if (userRole !== 'admin') {
      const user = await User.findByPk(creatorId, { transaction: trx, lock: true });
      const fuel = getCurrentFuel(user);
      if (fuel < FUEL_COST) {
        await trx.rollback();
        return res.status(403).json({ error: `Not enough energy: ${fuel} / ${FUEL_COST}` });
      }
      await consumeFuel(user, FUEL_COST, trx);   // атомарное списание
    }

    // ===== Создаём сам квиз
    const newQuiz = await Quiz.create({
      title,
      cover,
      category_id,
      question_quantity: questions.length,
      creator_id: creatorId
    }, { transaction: trx });

    // ===== Вопросы / ответы (как было)
    for (const q of questions) {
      const newQ = await Question.create({
        quiz_id: newQuiz.id,
        question_text : q.question_text,
        question_image: q.question_image || null
      }, { transaction: trx });

      for (const ans of q.answers) {
        await Answer.create({
          question_id: newQ.id,
          answer_text : ans.answer_text,
          is_correct  : ans.is_correct
        }, { transaction: trx });
      }
    }

    await trx.commit();
    return res.status(201).json({ message: 'Quiz created successfully', quizId: newQuiz.id });
  } catch (err) {
    await trx.rollback();
    console.error('Quiz creation error:', err);
    return res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const quizId = req.params.id;
    const { title, cover, category_id, questions } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Проверка обязательных полей
    if (!title || !cover || !category_id || !Array.isArray(questions)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'title, cover, category and questions are required' });
    }
    
    // Получаем квиз с транзакцией
    const quiz = await Quiz.findByPk(quizId, { transaction });
    if (!quiz) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Квиз не найден' });
    }
    
    // Если пользователь не является администратором и не является создателем квиза, запрещаем обновление
    if (userRole !== 'admin' && quiz.creator_id !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Нет прав на редактирование этого квиза' });
    }
    
    // Обновляем основные поля квиза
    await quiz.update(
      { title, cover, category_id, question_quantity: questions.length },
      { transaction }
    );
    
    // Удаляем старые вопросы (если настроено каскадное удаление, ответы удалятся автоматически)
    await Question.destroy({ where: { quiz_id: quizId }, transaction });
    
    // Вставляем новые вопросы и ответы
    for (const q of questions) {
      // Проверяем, что каждый вопрос имеет ровно 4 ответа
      if (!Array.isArray(q.answers) || q.answers.length !== 4) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each question must have exactly 4 answers.' });
      }
      // Проверяем, что правильных ответов от 1 до 2
      const correctCount = q.answers.reduce((acc, ans) => acc + (ans.is_correct ? 1 : 0), 0);
      if (correctCount < 1 || correctCount > 2) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Each question must have 1 to 2 correct answers.' });
      }
      
      // Создаём вопрос
      const newQuestion = await Question.create({
        quiz_id: quizId,
        question_text: q.question_text,
        question_image: q.question_image || null
      }, { transaction });
      
      // Создаём ответы для вопроса
      for (const ans of q.answers) {
        await Answer.create({
          question_id: newQuestion.id,
          answer_text: ans.answer_text,
          is_correct: ans.is_correct
        }, { transaction });
      }
    }
    
    await transaction.commit();
    res.json({ message: 'Квиз успешно обновлён' });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка обновления квиза:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return res.status(404).json({ error: 'Квиз не найден' });
    if (userRole !== 'admin' && quiz.creator_id !== userId) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }
    await quiz.destroy();
    res.json({ message: 'Квиз успешно удалён' });
  } catch (error) {
    console.error('Ошибка удаления квиза:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
};
