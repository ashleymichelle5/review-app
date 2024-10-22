const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Ruta para procesar el registro
router.post('/register', userController.register);

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Ruta para procesar el login
router.post('/login', userController.login);

// Ruta para procesar el logout
router.get('/logout', userController.logout);

module.exports = router;