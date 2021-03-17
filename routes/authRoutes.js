const express = require('express');

const router = express.Router();

const authControllers = require('../controllers/auth');

router.get('/login', authControllers.getLogin);

router.post('/login', authControllers.postLogin);

router.get('/signup', authControllers.getSignup);

router.post('/signup', authControllers.postSignup);

router.post('/logout', authControllers.postLogout);

router.get('/reset/:token', authControllers.getNewPassword);

router.get('/reset', authControllers.getReset);

router.post('/reset', authControllers.postReset);

router.post('/new-password', authControllers.postNewPassword);







module.exports = router;