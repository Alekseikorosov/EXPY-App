const express = require('express');
const router  = express.Router();
const { sendEmailCode, verifyEmailCode } = require('../controllers/emailCodeController');

router.post('/send',   sendEmailCode);    // принимает { email }
router.post('/verify', verifyEmailCode);  // принимает { email, code }

module.exports = router;
