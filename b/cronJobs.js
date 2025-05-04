// const cron = require('node-cron');
// const { Op } = require('sequelize');
// const QuizAttempt = require('./models/QuizAttempt');

// cron.schedule('*/10 * * * * ', async () => {
//   try {
//     const threshold = new Date(Date.now() - 3 * 60 * 60  * 1000); // для теста – 3 часа
//     // Находим записи, которые соответствуют критерию
//     const attemptsToDelete = await QuizAttempt.findAll({
//       where: {
//         status: 'active',
//         start_time: {
//           [Op.lt]: threshold
//         }
//       }
//     });

//     if (attemptsToDelete.length > 0) {
//       console.log('Удаляются следующие активные попытки:');
//       attemptsToDelete.forEach(attempt => {
//         console.log(`Attempt ID: ${attempt.id}, Start Time: ${attempt.start_time}`);
//       });

//       // Затем удаляем найденные записи
//       const deleted = await QuizAttempt.destroy({
//         where: {
//           status: 'active',
//           start_time: {
//             [Op.lt]: threshold
//           }
//         }
//       });
//       console.log(`Cron-job: удалено ${deleted} активных попыток.`);
//     } else {
//     //   console.log('Cron-job: нет активных попыток, превышающих порог.');
//     }
//   } catch (error) {
//     console.error('Cron-job error:', error);
//   }
// });
const cron = require('node-cron');
const { Op } = require('sequelize');
const QuizAttempt = require('./models/QuizAttempt');

const { User } = require('./models');    
const { syncFuel, MAX_FUEL } = require('./utils/fuel'); 

console.log('🕒 [CronJobs] module loaded');


// 1) Удаление зависших активных попыток старше 3 часов (каждый час)
cron.schedule('0 * * * *', async () => {
  try {
    const threshold = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 часа назад
    const staleActive = await QuizAttempt.findAll({
      where: {
        status: 'active',
        start_time: { [Op.lt]: threshold }
      }
    });

    if (staleActive.length) {
      console.log('Cron-job (active): удаляются активные попытки старше 3 часов:');
      staleActive.forEach(a => console.log(`ID ${a.id}, start_time ${a.start_time}`));
      const deleted = await QuizAttempt.destroy({
        where: {
          status: 'active',
          start_time: { [Op.lt]: threshold }
        }
      });
      console.log(`Cron-job (active): удалено ${deleted} попыток.`);
    }
  } catch (error) {
    console.error('Cron-job error (active clean):', error);
  }
});

// 2) Удаление завершённых попыток старше 45 дней (ежедневно в полночь)
cron.schedule('0 0 * * *', async () => {
  try {
    const thresholdFinished = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 дней назад
    const oldFinished = await QuizAttempt.findAll({
      where: {
        status: 'finished',
        end_time: { [Op.lt]: thresholdFinished }
      }
    });

    if (oldFinished.length) {
      console.log('Cron-job (finished): удаляются попытки старше 45 дней:');
      oldFinished.forEach(a => console.log(`ID ${a.id}, end_time ${a.end_time}`));
      const deleted = await QuizAttempt.destroy({
        where: {
          status: 'finished',
          end_time: { [Op.lt]: thresholdFinished }
        }
      });
      console.log(`Cron-job (finished): удалено ${deleted} попыток.`);
    }
  } catch (error) {
    console.error('Cron-job error (finished clean):', error);
  }
});

// в cronJobs.js

cron.schedule('* * * * *', async () => {
  console.log('🕒 [CronJobs] fuel tick at', new Date().toLocaleTimeString());
  try {
    const usersToSync = await User.findAll({ where: { fuel: { [Op.lt]: MAX_FUEL } } });
    console.log(`…syncing fuel for ${usersToSync.length} users…`);
    for (const user of usersToSync) {
      await syncFuel(user);
    }
    console.log('…fuel sync done');
  } catch (error) {
    console.error('Cron-job error (fuel sync):', error);
  }
});
