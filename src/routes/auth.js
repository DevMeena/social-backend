const express = require('express');
const router = new express.Router();
const cors = require('cors');
const {
  signup,
  login,
  googleLogin,
  verifyEmail,
  verifyToken,
  forgotPassword,
} = require('../controllers/auth'); // authCheck, logout

// ! ALL ROUTES ACCESSIBLE FROM FRONTEND

router.post('/verifyEmail', cors(), verifyEmail);
router.post('/verifyToken', cors(), verifyToken);
router.post('/signup', cors(), signup);

router.post('/login', cors(), login);
router.post('/googlelogin', cors(), googleLogin);

router.post('/forgotPassword', cors(), forgotPassword);

// router.get('/user/logout', cors(), logout);
// router.post('/user/authCheck', cors(), authCheck);

module.exports = router;
