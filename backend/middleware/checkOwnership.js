// middleware/checkOwnership.js
const checkOwnership = (getOwnerId) => {
    return async (req, res, next) => {
      try {
        // getOwnerId – функция, которая возвращает ID владельца ресурса (например, квиза)
        const ownerId = await getOwnerId(req);
        if (req.user.role !== 'admin' && req.user.id !== ownerId) {
          return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }
        next();
      } catch (error) {
        console.error('Access rights verification error:', error);
        return res.status(500).json({ error: 'Access rights verification error' });
      }
    };
  };
  
  module.exports = checkOwnership;
  
