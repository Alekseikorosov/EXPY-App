require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Category = require('../models/Category');
const QuizProgress = require('../models/QuizProgress');
const { containerClient } = require('../config/azure');

const { getCurrentFuel, consumeFuel } = require('../utils/fuel');
const FUEL_COST = 20;

const validator = require('validator');
function isValidImageUrl(url) {
  return validator.isURL(url, { protocols: ['http','https'], require_protocol: true })
      && /\.(jpe?g|png|bmp|webp)(\?.*)?$/i.test(url);
}

// не больше 5 МБ
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// простая проверка URL + расширение
function isValidImageUrl(url) {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return /\.(jpe?g|png|bmp|webp)(\?.*)?$/i.test(url);
}


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
    console.error('Error receiving quizzes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
      console.error('Error getting categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  };


  exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });
    return res.json(categories);
  } catch (err) {
    console.error('Ошибка при получении всех категорий:', err);
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
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Если ?mode=edit, значит хотим редактировать
    if (mode === 'edit') {
      // Проверяем, что пользователь авторизован
      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized (token needed) to edit' });
      }
      // Проверяем, что либо владелец, либо админ
      if (req.user.role !== 'admin' && quiz.creator_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to edit this quiz.' });
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
    console.error('Error receiving quiz:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

// quizzesController.js
// Обновлённый метод createQuiz в quizzesController.js
// Обновлённый метод createQuiz в quizzesController.js
exports.createQuiz = async (req, res) => {
  try {
    // 1️⃣ Load fresh user and consume fuel if needed
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.role !== 'admin') {
      try {
        await consumeFuel(user, FUEL_COST);
      } catch {
        return res.status(403).json({ error: 'Not enough energy to create a quiz' });
      }
    }

    // 2️⃣ Parse and validate request body
    const { title, category_id } = req.body;


    let questions;
    try {
      questions = JSON.parse(req.body.questions);
    } catch {
      return res.status(400).json({ error: 'Invalid questions format' });
    }
    if (!title || !category_id || !Array.isArray(questions) || questions.length < 5) {
      return res.status(400).json({ error: 'Required title, category_id and at least 5 questions' });
    }

if (title.length > 50) {
          return res.status(400).json({ error: 'Title must be at most 50 characters' });
        }

        for (const [i, q] of questions.entries()) {
          if (!q.question_text || q.question_text.length > 100) {
            return res.status(400).json({
              error: `Question #${i + 1}: text must be no more than 100 characters`
            });
          }
          for (const [j, ans] of (q.answers || []).entries()) {
            if (!ans.answer_text || ans.answer_text.length > 50) {
              return res.status(400).json({
                error: `Question #${i + 1}, answer #${j + 1}: answer length must be no more than 50 characters`
              });
            }
          }
        }


    // 3️⃣ Validate question image URLs
    for (const [i, q] of questions.entries()) {
      if (q.question_image) {
        if (!isValidImageUrl(q.question_image)) {
          return res.status(400).json({ error: `Question #${i + 1}: the link must point to an image JPG/PNG/BMP/WEBP` });
        }
      }
    }

    // 4️⃣ Validate file sizes (cover and question images)
    if (req.files.cover?.[0]) {
      if (req.files.cover[0].size > MAX_FILE_SIZE) {
        return res.status(413).json({ error: 'The cover file is larger than 5 MB' });
      }
    }
    if (req.files.questionImages) {
      for (const file of req.files.questionImages) {
        if (file.size > MAX_FILE_SIZE) {
          return res.status(413).json({ error: 'One of the question pictures exceeds 5 MB' });
        }
      }
    }

    // 5️⃣ Collect question file indexes
    let imageIdxs = req.body.questionIndexes || [];
    if (!Array.isArray(imageIdxs)) imageIdxs = [imageIdxs];
    imageIdxs = imageIdxs.map(i => parseInt(i, 10));

    // 6️⃣ Create draft Quiz without cover (skip validation of non-empty cover)
    const quiz = await Quiz.create({
      title,
      category_id,
      question_quantity: questions.length,
      creator_id: user.id,
      cover: ''
    }, { validate: false });

    // 7️⃣ Handle cover: upload file or validate URL
    let coverUrl = '';
    if (req.files.cover?.[0]) {
      const file = req.files.cover[0];
      const blobName = `${quiz.id}/cover/${uuidv4()}-${file.originalname}`;
      const blobCli  = containerClient.getBlockBlobClient(blobName);
      await blobCli.upload(file.buffer, file.size);
      coverUrl = blobCli.url;
    } else if (req.body.cover) {
      if (!isValidImageUrl(req.body.cover)) {
        await quiz.destroy();
        return res.status(400).json({ error: 'Cover URL is invalid or not an image' });
      }
      coverUrl = req.body.cover;
    }
    if (!coverUrl) {
      await quiz.destroy();
      return res.status(400).json({ error: 'Cover is required (file or URL)' });
    }
    await quiz.update({ cover: coverUrl });

    // 8️⃣ Transaction: create questions, upload question files, create answers
    const trx = await sequelize.transaction();
    try {
      const createdQs = [];
      // 8.1) Create question records with text and optional URL
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const newQ = await Question.create({
          quiz_id:       quiz.id,
          question_text: q.question_text,
          question_image: q.question_image || ''
        }, { transaction: trx });
        createdQs.push(newQ);
      }
      // 8.2) Upload question image files
      const files = req.files.questionImages || [];
      for (let f = 0; f < files.length; f++) {
        const idx  = imageIdxs[f];
        const file = files[f];
        const q    = createdQs[idx];
        if (!q) continue;
        const blobName = `${quiz.id}/questions/q${idx+1}/${uuidv4()}-${file.originalname}`;
        const blobCli  = containerClient.getBlockBlobClient(blobName);
        await blobCli.upload(file.buffer, file.size);
        await q.update({ question_image: blobCli.url }, { transaction: trx });
      }
      // 8.3) Create answers
      for (let i = 0; i < questions.length; i++) {
        for (const ans of questions[i].answers) {
          await Answer.create({
            question_id: createdQs[i].id,
            answer_text: ans.answer_text,
            is_correct:  ans.is_correct
          }, { transaction: trx });
        }
      }
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      await quiz.destroy();
      console.error(err);
      return res.status(500).json({ error: 'Failed to save questions' });
    }

    // 9️⃣ Success
    return res.status(201).json({ message: 'Quiz created', quizId: quiz.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


// controllers/quizzesController.js

// controllers/quizzesController.js
exports.updateQuiz = async (req, res) => {
  const quizId   = req.params.id;
  const userId   = req.user.id;
  const userRole = req.user.role;
  let { title, category_id, questions } = req.body;

  

  // 1) Если пришёл массив строкой — парсим первым делом
  if (typeof questions === 'string') {
    try { questions = JSON.parse(questions); }
    catch { return res.status(400).json({ error: 'Incorrect format questions' }); }
  }
  // 2) Базовая валидация
  if (!title || !category_id || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Need title, category_id and questions array' });
  }

  // 3) Проверяем существование и права
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  if (quiz.creator_id !== userId && userRole !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // 4) Обрабатываем обложку
  let newCoverUrl = quiz.cover;
  // — пришёл файл
  if (req.files?.cover?.[0]) {
    const file = req.files.cover[0];
    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({ error: 'Cover file exceeds 5 MB' });
    }
    // удаляем старый blob, если был
    if (quiz.cover && quiz.cover.startsWith(containerClient.url)) {
      const oldBlob = quiz.cover.slice(containerClient.url.length + 1).split('?')[0];
      await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
    }
    // загружаем новый
    const blobName = `${quiz.id}/cover/${uuidv4()}-${file.originalname}`;
    const cli      = containerClient.getBlockBlobClient(blobName);
    await cli.upload(file.buffer, file.size);
    newCoverUrl = cli.url;
  }
  // — или пришёл URL и он отличается
  else if (req.body.cover && req.body.cover !== quiz.cover) {
    if (!isValidImageUrl(req.body.cover)) {
      return res.status(400).json({ error: 'Invalid cover URL' });
    }
    // удаляем старый blob
    if (quiz.cover && quiz.cover.startsWith(containerClient.url)) {
      const oldBlob = quiz.cover.slice(containerClient.url.length + 1).split('?')[0];
      await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
    }
    newCoverUrl = req.body.cover;
  }
  // — если пользователь явно очистил обложку
  else if (req.body.cover === '') {
    if (quiz.cover && quiz.cover.startsWith(containerClient.url)) {
      const oldBlob = quiz.cover.slice(containerClient.url.length + 1).split('?')[0];
      await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
    }
    newCoverUrl = '';
  }

  // 5) Транзакция: обновляем Quiz и вопросы
  const trx = await sequelize.transaction();
  try {
    await quiz.update({
      title,
      category_id,
      question_quantity: questions.length,
      cover: newCoverUrl
    }, { transaction: trx });

    // 5.1) файлы вопросов
    let imageIdxs = req.body.questionIndexes || [];
    if (!Array.isArray(imageIdxs)) imageIdxs = [imageIdxs];
    imageIdxs = imageIdxs.map(i => parseInt(i, 10));
    const files = req.files.questionImages || [];

    // 5.2) создаём/обновляем каждый вопрос
    for (let i = 0; i < questions.length; i++) {
      const qIn = questions[i];
      let qRec;

      // A) существующий
      if (qIn.question_id) {
        qRec = await Question.findByPk(qIn.question_id, { transaction: trx });
        if (!qRec) throw new Error(`Question #${i+1} not found`);
      }
      // B) новый
      else {
        qRec = await Question.create({
          quiz_id:       quiz.id,
          question_text: ''
        }, { transaction: trx });
      }

      // 5.2.1) обновляем текст
      await qRec.update({ question_text: qIn.question_text || '' }, { transaction: trx });

      // 5.2.2) картинка вопроса
      const oldUrl = qRec.question_image || '';
      let newUrl = '';
      const fileIndex = imageIdxs.findIndex(idx => idx === i);
      const fileObj   = files[fileIndex] || null;
      



      if (title.length > 50) {
          return res.status(400).json({ error: 'Title must be at most 50 characters' });
        }

        for (const [i, q] of questions.entries()) {
          if (!q.question_text || q.question_text.length > 100) {
            return res.status(400).json({
              error: `Question #${i + 1}: text must be no more than 100 characters`
            });
          }
          for (const [j, ans] of (q.answers || []).entries()) {
            if (!ans.answer_text || ans.answer_text.length > 50) {
              return res.status(400).json({
                error: `Question #${i + 1}, answer #${j + 1}: answer length must be no more than 50 characters`
              });
            }
          }
        }
      // — загружен новый файл
      if (fileObj) {
        if (fileObj.size > MAX_FILE_SIZE) {
          throw new Error(`Question file #${i+1} is larger than 5 MB`);
        }
        // удаляем старый blob, если он был в Azure
        if (oldUrl.startsWith(containerClient.url)) {
          const oldBlob = oldUrl.substring(containerClient.url.length + 1).split('?')[0];
          await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
        }
        // загружаем новый файл
        const blobName = `${quiz.id}/questions/q${i+1}/${uuidv4()}-${fileObj.originalname}`;
        const cli      = containerClient.getBlockBlobClient(blobName);
        await cli.upload(fileObj.buffer, fileObj.size);
        newUrl = cli.url;
      }
      // — смена на URL или удаление картинки
      else if (typeof qIn.question_image === 'string' && qIn.question_image !== oldUrl) {
        if (qIn.question_image) {
          // пришёл новый URL — валидируем и удаляем старый blob
          if (!isValidImageUrl(qIn.question_image)) {
            throw new Error(`Invalid image URL for question #${i+1}`);
          }
          if (oldUrl.startsWith(containerClient.url)) {
            const oldBlob = oldUrl.substring(containerClient.url.length + 1).split('?')[0];
            await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
          }
          newUrl = qIn.question_image;
        } else {
          // пользователь очистил поле — удаляем старый blob
          if (oldUrl.startsWith(containerClient.url)) {
            const oldBlob = oldUrl.substring(containerClient.url.length + 1).split('?')[0];
            await containerClient.getBlockBlobClient(oldBlob).deleteIfExists();
          }
          newUrl = '';
        }
      }
      // — иначе ничего не меняем
      else {
        newUrl = oldUrl;
      }
      
      await qRec.update({ question_image: newUrl }, { transaction: trx });

      // 5.2.3) ответы: стираем старые, создаём новые
      await Answer.destroy({ where: { question_id: qRec.id }, transaction: trx });
      for (const ans of (qIn.answers || [])) {
        await Answer.create({
          question_id: qRec.id,
          answer_text: ans.answer_text,
          is_correct:  ans.is_correct
        }, { transaction: trx });
      }
    }

    // 5.3) удаляем вопросы, которых уже нет
    const existingQs = await Question.findAll({
      where:     { quiz_id: quiz.id },
      transaction: trx
    });
    const incomingIds = questions
      .filter(q => q.question_id)
      .map(q => q.question_id);
    const toDelete = existingQs
      .filter(q => !incomingIds.includes(q.id))
      .map(q => q.id);

    for (const qid of toDelete) {
      const qRec = existingQs.find(q => q.id === qid);
      const imgUrl = qRec.question_image || '';
      if (imgUrl.startsWith(containerClient.url)) {
        const blob = imgUrl.slice(containerClient.url.length + 1).split('?')[0];
        await containerClient.getBlockBlobClient(blob).deleteIfExists();
      }
      await Answer.destroy({ where: { question_id: qid }, transaction: trx });
      await Question.destroy({ where: { id: qid },          transaction: trx });
    }

    await trx.commit();
    return res.json({ message: 'Quiz successful updated!' });
  } catch (err) {s
    await trx.rollback();
    console.error('Error updateQuiz:', err);
    return res.status(500).json({ error: err.message || 'Failed to update quiz' });
  }
};




exports.deleteQuiz = async (req, res) => {
  try {
    const quizId   = req.params.id;
    const userId   = req.user.id;
    const userRole = req.user.role;

    // 1) Проверяем, что квиз существует и права доступа
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if (userRole !== 'admin' && quiz.creator_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 2) Удаляем все blobs из папки `${quizId}/…`
    for await (const blob of containerClient.listBlobsFlat({ prefix: `${quizId}/` })) {
      const blobClient = containerClient.getBlockBlobClient(blob.name);
      await blobClient.delete();
    }

    // 3) Удаляем сам квиз (и связанные вопросы/ответы через каскад)
    await quiz.destroy();

    return res.json({ message: 'Quiz and its images deleted' });
  } catch (err) {
    console.error('Error in deleteQuiz:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};