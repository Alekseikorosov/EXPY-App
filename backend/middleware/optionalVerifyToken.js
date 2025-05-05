// // middleware/optionalVerifyToken.js
// const jwt = require('jsonwebtoken');

// function optionalVerifyToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   if (!authHeader) {
//     // Нет заголовка — гость
//     return next();
//   }
//   const token = authHeader.split(' ')[1];
//   if (!token) {
//     // Если нет токена после Bearer, тоже гость
//     return next();
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       // Неверный токен — тоже считаем гостем (или можно вернуть 403)
//       return next();
//     }
//     req.user = decoded; // { id, username, role }
//     next();
//   });
// }

// module.exports = optionalVerifyToken;
const jwt = require('jsonwebtoken');

function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  if (!authHeader) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification error:', err);
      return next();
    }
    console.log('Decoded token:', decoded);
    req.user = decoded; // { id, username, role }
    next();
  });
}

module.exports = optionalVerifyToken;
