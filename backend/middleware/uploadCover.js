// middleware/uploadCover.js
const multer = require('multer');
// храним файл в памяти, чтобы сразу залить в Azure
const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }   // ← максимум 5 МБ
});
