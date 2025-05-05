// // // backend/middleware/auth.js
// const jwt = require('jsonwebtoken');

// exports.verifyToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   // Ожидаем формат: "Bearer <token>"
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: 'Неверный токен' });
//     req.user = decoded; // decoded содержит данные токена (id, username, role)
//     next();
//   });
// };

// // backend/routes/auth.js

// const express = require('express');
// const router = express.Router();

// // router.post('/token', ...)



// router.post('/token', (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) {
//     return res.status(401).json({ error: 'Refresh token обязателен' });
//   }
  
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userPayload) => {
//     if (err) {
//       return res.status(403).json({ error: 'Неверный или просроченный refresh token' });
//     }
//     // userPayload содержит { id, username, role, iat, exp }
//     // Генерируем новый access token
//     const newAccessToken = jwt.sign(
//       { id: userPayload.id, username: userPayload.username, role: userPayload.role },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: '1h' }
//     );
//     res.json({ accessToken: newAccessToken });
//   });
// });
// module.exports = router;


// const jwt = require('jsonwebtoken');

// exports.verifyToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Токен не предоставлен' });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ error: 'Неверный токен' });
//     }
//     req.user = decoded;
//     next();
//   });
// };
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = decoded;
    next();
  });
};

