const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const cors = require('cors');
const { signup, login, logout, googleLogin, authCheck } = require('../controllers/user');

router.post('/user/signup', cors(), signup);

router.post('/user/login', cors(), login);

// router.get('/user/logout', cors(), logout);

router.post('/user/googlelogin', cors(), googleLogin);

router.post('/user/authCheck', cors(), authCheck);

module.exports = router;