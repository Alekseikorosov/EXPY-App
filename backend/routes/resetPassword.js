const express = require('express');
const router = express.Router();
const { resetPassword, updatePassword, verifyCode } = require('../controllers/resetPasswordController');

router.post('/resetpass', resetPassword);
router.post('/update-password', updatePassword);
router.post('/verify-code', verifyCode);

module.exports = router;
