const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * Ruta para registrar un nuevo usuario
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Ruta para iniciar sesión
 */
router.post('/login', authController.login);

module.exports = router;