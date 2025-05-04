// controllers/quizGameController.js
const { v4: uuidv4 } = require('uuid');  // для генерации guest_id (по желанию)
const { Quiz, QuizAttempt, Question, Answer, User } = require('../models');
const QuizProgress = require('../models/QuizProgress');
// Если у вас index.js, где экспортируются все модели, или подключайте по отдельности

module.exports = {
  // 1) Начало квиза
  startQuiz: async (req, res) => {
    try {
      const { quiz_id } = req.body;
      if (!quiz_id) {
        return res.status(400).json({ error: 'quiz_id is required' });
      }
      // Проверяем, что такой квиз существует
      const quiz = await Quiz.findByPk(quiz_id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Если пользователь авторизован, берем user_id из req.user.id;
      // если нет, генерируем guest_id
      let userId = null;
      let guestId = null;
      if (req.user) {
        // Авторизованный
        userId = req.user.id;
      } else {
        // Гость
        guestId = uuidv4();
      }

      // Создаём попытку
      const newAttempt = await QuizAttempt.create({
        quiz_id,
        user_id: userId,
        guest_id: guestId,
        status: 'active',
        user_results: {} // Пустой JSON (будем заполнять ответами)
      });

      return res.json({
        message: 'Quiz attempt started',
        attempt: newAttempt
      });
    } catch (error) {
      console.error('startQuiz error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // controllers/quizGameController.js
cancelQuiz: async (req, res) => {
  try {
    const { attempt_id } = req.body;
    if (!attempt_id) {
      return res.status(400).json({ error: 'attempt_id is required' });
    }

    const attempt = await QuizAttempt.findByPk(attempt_id);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    // Проверяем, что попытка в статусе active
    if (attempt.status === 'active') {
      await attempt.destroy(); 
      // Или, если хотите просто помечать как "cancelled":
      // attempt.status = 'cancelled';
      // await attempt.save();
      return res.json({ message: 'Quiz attempt cancelled/deleted' });
    }

    // Если уже finished или cancelled
    return res.status(400).json({ error: 'Attempt is not active' });
  } catch (error) {
    console.error('cancelQuiz error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
},


  // 2) Ответ на вопрос
// 2) Ответ на вопрос
// submitAnswer: async (req, res) => {
//   try {
//     const { attempt_id, question_id, answer_id } = req.body;
//     if (!attempt_id || !question_id || !answer_id) {
//       return res.status(400).json({ error: 'attempt_id, question_id, answer_id required' });
//     }
//     const attempt = await QuizAttempt.findByPk(attempt_id);
//     if (!attempt) {
//       return res.status(404).json({ error: 'Quiz attempt not found' });
//     }
//     if (attempt.status !== 'active') {
//       return res.status(400).json({ error: 'Cannot submit answer to a finished or cancelled attempt' });
//     }
//     // Обновляем user_results как объект
//     const results = attempt.user_results || {};
//     results[question_id] = answer_id;
//     attempt.user_results = results;
//     await attempt.save();
    
//     // Если это последний вопрос – автозавершение
//     const totalQuestions = await Question.count({ where: { quiz_id: attempt.quiz_id } });
//     if (Object.keys(results).length >= totalQuestions) {
//       attempt.status = 'finished';
//       attempt.end_time = new Date();
//       let correctCount = 0;
//       const questionKeys = Object.keys(results).filter(key => key !== 'final_score');
//       for (let qId of questionKeys) {
//         const answer = await Answer.findByPk(results[qId]);
//         if (answer && answer.is_correct) {
//           correctCount++;
//         }
//       }
//       attempt.final_score = correctCount;
//       // Генерируем токен для результата
//       const resultToken = uuidv4();
//       attempt.result_token = resultToken;
//       await attempt.save();
//       return res.json({
//         message: 'Answer submitted and quiz finished automatically',
//         attempt,
//         resultToken,
//       });
//     }
    
    
//     return res.json({
//       message: 'Answer submitted',
//       attempt,
//     });
//   } catch (error) {
//     console.error('submitAnswer error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// },
submitAnswer: async (req, res) => {
  try {
    const { attempt_id, question_id, answer_id } = req.body;
    if (!attempt_id || !question_id || !answer_id) {
      return res.status(400).json({ error: 'attempt_id, question_id, answer_id required' });
    }

    const attempt = await QuizAttempt.findByPk(attempt_id);
    if (!attempt || attempt.status !== 'active') {
      return res.status(400).json({ error: 'Cannot submit answer to this attempt' });
    }

    // сохраняем ответ
    const results = attempt.user_results || {};
    results[question_id] = answer_id;
    attempt.user_results = results;
    await attempt.save();

    // считаем прогресс
    const totalQ   = await Question.count({ where: { quiz_id: attempt.quiz_id } });
    const answered = Object.keys(results).length;
    let correct    = 0;
    for (let qId of Object.keys(results)) {
      const ans = await Answer.findByPk(results[qId]);
      if (ans?.is_correct) correct++;
    }
    const newPct = Math.floor((correct / totalQ) * 100);

    // обновляем прогресс ТОЛЬКО если авторизован и если новая доля лучше
    if (req.user?.id) {
      const [prev] = await QuizProgress.findOrCreate({
        where: { user_id: req.user.id, quiz_id: attempt.quiz_id },
        defaults: {
          answered_count: answered,
          correct_count:  correct,
          question_quantity: totalQ
        }
      });

      // если запись уже была и новая % выше старой — обновляем
      if (!prev._options.isNewRecord) {
        const oldPct = Math.floor((prev.correct_count / prev.question_quantity) * 100);
        if (newPct > oldPct) {
          prev.answered_count    = answered;
          prev.correct_count     = correct;
          prev.question_quantity = totalQ;
          await prev.save();
        }
      }
    }

    // автозавершение
    if (answered >= totalQ) {
      attempt.status      = 'finished';
      attempt.end_time    = new Date();
      attempt.final_score = correct;
      const resultToken   = uuidv4();
      attempt.result_token = resultToken;
      await attempt.save();

      return res.json({ message: 'Finished', attempt, resultToken });
    }

    return res.json({ message: 'Answer submitted', attempt });
  } catch (error) {
    console.error('submitAnswer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
},

  getQuestions: async (req, res) => {
    try {
      const { quizId } = req.params;
      // Находим все вопросы для квиза quizId с их вариантами ответов
      const questions = await Question.findAll({
        where: { quiz_id: quizId },
        order: [['id', 'ASC']],
        include: [{ model: Answer, as: 'answers' }]
      });
      return res.json(questions);
    } catch (error) {
      console.error('getQuestions error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // 3) Завершение квиза
  // finishQuiz: async (req, res) => {
  //   try {
  //     const { attempt_id } = req.body;
  //     if (!attempt_id) {
  //       return res.status(400).json({ error: 'attempt_id is required' });
  //     }
      
  //     const attempt = await QuizAttempt.findByPk(attempt_id);
  //     if (!attempt) {
  //       return res.status(404).json({ error: 'Quiz attempt not found' });
  //     }
      
  //     // Если попытка уже не активна
  //     if (attempt.status !== 'active') {
  //       if (attempt.status === 'finished') {
  //         // Если токен ещё не сгенерирован, генерируем его
  //         if (!attempt.result_token) {
  //           attempt.result_token = uuidv4();
  //           await attempt.save();
  //         }
  //         return res.json({
  //           message: 'Quiz attempt already finished',
  //           attempt,
  //           resultToken: attempt.result_token,
  //         });
  //       }
  //       return res.status(400).json({ error: 'Attempt is not active' });
  //     }
      
  //     // Завершаем попытку
  //     attempt.status = 'finished';
  //     attempt.end_time = new Date();
      
  //     // Подсчитываем правильные ответы
  //     const userResults = attempt.user_results || {};
  //     let correctCount = 0;
  //     const questionKeys = Object.keys(userResults).filter(key => key !== 'final_score');
  //     for (let qId of questionKeys) {
  //       const chosenAnswerId = userResults[qId];
  //       const answer = await Answer.findByPk(chosenAnswerId);
  //       if (answer && answer.is_correct) {
  //         correctCount++;
  //       }
  //     }
      
  //     attempt.final_score = correctCount;
  //     // Генерируем токен и сохраняем его в attempt
  //     const resultToken = uuidv4();
  //     attempt.result_token = resultToken;
  //     await attempt.save();
      
  //     return res.json({
  //       message: 'Quiz attempt finished',
  //       correctCount,
  //       total: questionKeys.length,
  //       resultToken,
  //       attempt,
  //     });
  //   } catch (error) {
  //     console.error('finishQuiz error:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // },
  
  
  finishQuiz: async (req, res) => {
    try {
      const { attempt_id } = req.body;
      if (!attempt_id) {
        return res.status(400).json({ error: 'attempt_id is required' });
      }

      const attempt = await QuizAttempt.findByPk(attempt_id);
      if (!attempt) {
        return res.status(404).json({ error: 'Quiz attempt not found' });
      }
      if (attempt.status !== 'active') {
        // если уже завершён — отдадим старый токен
        if (attempt.status === 'finished') {
          return res.json({
            message: 'Already finished',
            attempt,
            resultToken: attempt.result_token
          });
        }
        return res.status(400).json({ error: 'Attempt is not active' });
      }

      // закрываем попытку
      attempt.status   = 'finished';
      attempt.end_time = new Date();

      // подсчитываем
      const userResults = attempt.user_results || {};
      let correctCount  = 0;
      const qKeys = Object.keys(userResults);
      for (let qId of qKeys) {
        const ans = await Answer.findByPk(userResults[qId]);
        if (ans?.is_correct) correctCount++;
      }
      attempt.final_score = correctCount;

      // генерируем токен и сохраняем
      const resultToken = uuidv4();
      attempt.result_token = resultToken;
      await attempt.save();

      // аналогично — обновляем прогресс, только если % вырос
      if (req.user?.id) {
        const totalQ   = qKeys.length;
        const newPct   = Math.floor((correctCount / totalQ) * 100);
        const [prev] = await QuizProgress.findOrCreate({
          where: { user_id: req.user.id, quiz_id: attempt.quiz_id },
          defaults: {
            answered_count: totalQ,
            correct_count:  correctCount,
            question_quantity: totalQ
          }
        });

        if (!prev._options.isNewRecord) {
          const oldPct = Math.floor((prev.correct_count / prev.question_quantity) * 100);
          if (newPct > oldPct) {
            prev.answered_count    = totalQ;
            prev.correct_count     = correctCount;
            prev.question_quantity = totalQ;
            await prev.save();
          }
        }
      }

      return res.json({
        message: 'Quiz finished',
        correctCount,
        total: qKeys.length,
        resultToken,
        attempt
      });
    } catch (error) {
      console.error('finishQuiz error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  checkActive: async (req, res) => {
    try {
      const { attemptId } = req.params;
      const attempt = await QuizAttempt.findByPk(attemptId);
      if (!attempt || attempt.status !== 'active') {
        return res.json({ active: false });
      }
      // Если нашли попытку и она в статусе active:
      return res.json({ active: true });
    } catch (error) {
      console.error('checkActive error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  // 4) Получить результаты прохождения
  // Возвращает структуру: вопросы, выбранные ответы, какая из них правильная и т.д.
  getResult: async (req, res) => {
    try {
      const { attemptId } = req.params;
      const guestToken = req.query.token; // одноразовый токен для гостя

      // Находим попытку вместе с информацией о квизе
      const attempt = await QuizAttempt.findByPk(attemptId, {
        include: [{ model: Quiz, as: 'quiz' }]
      });

      if (!attempt) {
        return res.status(404).json({ error: 'Quiz attempt not found' });
      }

      // 1) Если JWT есть и пользователь — владелец попытки, пропускаем
      if (req.user && attempt.user_id === req.user.id) {
        // ничего не делаем с guestToken
      }
      // 2) Иначе, если пришёл правильный guestToken — расходуем его
      else if (guestToken && guestToken === attempt.result_token) {
        attempt.result_token = null;
        await attempt.save();
      }
      // 3) Иначе — отказ
      else {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Собираем ответы
      const userResults = attempt.user_results || {};
      const questions = await Question.findAll({
        where: { quiz_id: attempt.quiz_id },
        include: [{ model: Answer, as: 'answers' }]
      });

      const details = questions.map(q => {
        const chosenId = userResults[q.id] || null;
        return {
          question_id: q.id,
          question_text: q.question_text,
          question_image: q.question_image,
          answers: q.answers.map(a => ({
            id: a.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            chosen: a.id === chosenId
          }))
        };
      });

      return res.json({
        attemptId: attempt.id,
        quizId: attempt.quiz_id,
        status: attempt.status,
        end_time: attempt.end_time,
        final_score: attempt.final_score,
        details
      });
    } catch (error) {
      console.error('getResult error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  
};
