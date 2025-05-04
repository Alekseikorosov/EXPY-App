// middleware/checkOwnership.js
const checkOwnership = (getOwnerId) => {
    return async (req, res, next) => {
      try {
        // getOwnerId – функция, которая возвращает ID владельца ресурса (например, квиза)
        const ownerId = await getOwnerId(req);
        if (req.user.role !== 'admin' && req.user.id !== ownerId) {
          return res.status(403).json({ error: 'Нет прав на выполнение этого действия' });
        }
        next();
      } catch (error) {
        console.error('Ошибка проверки прав доступа:', error);
        return res.status(500).json({ error: 'Ошибка проверки прав доступа' });
      }
    };
  };
  
  module.exports = checkOwnership;
  
