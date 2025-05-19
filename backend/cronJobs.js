const cron = require('node-cron');
const { Op } = require('sequelize');
const QuizAttempt = require('./models/QuizAttempt');
const EmailConfirmation = require('./models/EmailConfirmation'); 
const {  MAX_FUEL } = require('./utils/fuel'); 
const { sequelize } = require('./models');

console.log('🕒 [CronJobs] module loaded');


 // 1) Удаление зависших активных попыток старше 3 часов (каждый час)
 cron.schedule('0 * * * *', async () => {
  try {
    const threshold = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 часа назад
    const deleted = await QuizAttempt.destroy({
      where: { status: 'active', start_time: { [Op.lt]: threshold } }
    });
    if (deleted) console.log(`[cron] active cleanup: –${deleted}`);
  } catch (error) {
    console.error('Cron-job error (active clean):', error);
  }
});

// 2) Удаление завершённых попыток старше 45 дней (ежедневно в полночь)
cron.schedule('0 0 * * *', async () => {
  try {
        const thresholdFinished = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        const deleted = await QuizAttempt.destroy({
          where: { status: 'finished', end_time: { [Op.lt]: thresholdFinished } }
        });
        if (deleted) console.log(`[cron] finished cleanup: –${deleted}`);
       } catch (error) {
         console.error('Cron-job error (finished clean):', error);
       }
     });


cron.schedule('*/5 * * * *', async () => {
  try {
    await sequelize.query(`
      UPDATE users
      SET    fuel = LEAST(fuel + 1, :maxFuel)
      WHERE  fuel < :maxFuel
    `, { replacements: { maxFuel: MAX_FUEL } });
    console.log('[cron] fuel tick: +1 fuel (bulk)');
  } catch (error) {
    console.error('Cron-job error (fuel sync):', error);
  }
});

cron.schedule('0 * * * *', async () => {
    try {
      const threshold = new Date(Date.now() - 60 * 60 * 1000); // 1 час
      const deleted = await EmailConfirmation.destroy({
        where: { createdAt: { [Op.lt]: threshold } }
      });
      if (deleted) console.log(`[cron] email confirmations: –${deleted}`);
    } catch (error) {
      console.error('Cron-job error (email confirmations):', error);
    }
  });
