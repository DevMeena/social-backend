const express = require('express');
const router = new express.Router();
const cors = require('cors');
const {
  signup,
  login,
  googleLogin,
  verifyEmail,
  verifyToken,
} = require('../controllers/user'); // authCheck, logout

router.post('/user/verifyEmail', cors(), verifyEmail);
router.post('/user/verifyToken', cors(), verifyToken);
router.post('/user/signup', cors(), signup);

router.post('/user/login', cors(), login);
router.post('/user/googlelogin', cors(), googleLogin);

// router.get('/user/logout', cors(), logout);
// router.post('/user/authCheck', cors(), authCheck);

module.exports = router;
