const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser } = require('../config/database');

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_cambiar_en_produccion';

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
async function register(req, res) {
  try {
    // Extraer datos del body
    const { usuario, contraseña } = req.body;

    // Validar que se recibieron los datos
    if (!usuario || !contraseña) {
      return res.status(400).json({
        error: 'Usuario y contraseña son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await findUserByUsername(usuario);
    
    if (usuarioExistente) {
      return res.status(409).json({
        error: 'El usuario ya existe'
      });
    }

    // Encriptar contraseña con bcrypt (10 rounds de salt)
    const contraseñaHash = await bcrypt.hash(contraseña, 10);

    // Crear usuario en la base de datos
    const nuevoUsuario = await createUser(usuario, contraseñaHash);

    // Responder con éxito
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario.usuario
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: error.message
    });
  }
}

/**
 * Autentica a un usuario y genera token JWT
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
async function login(req, res) {
  try {
    // Extraer credenciales del body
    const { usuario, contraseña } = req.body;

    // Validar que se recibieron los datos
    if (!usuario || !contraseña) {
      return res.status(400).json({
        error: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const usuarioEncontrado = await findUserByUsername(usuario);

    // Si no existe el usuario
    if (!usuarioEncontrado) {
      return res.status(401).json({
        error: 'Error en la autenticación: usuario o contraseña incorrectos'
      });
    }

    // Verificar contraseña usando bcrypt
    const contraseñaValida = await bcrypt.compare(
      contraseña, 
      usuarioEncontrado.contraseña
    );

    // Si la contraseña no coincide
    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'Error en la autenticación: usuario o contraseña incorrectos'
      });
    }

    // Generar token JWT (válido por 24 horas)
    const token = jwt.sign(
      { 
        id: usuarioEncontrado.id, 
        usuario: usuarioEncontrado.usuario 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Autenticación exitosa
    res.status(200).json({
      mensaje: 'Autenticación satisfactoria',
      usuario: usuarioEncontrado.usuario,
      token: token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error en el proceso de autenticación',
      detalle: error.message
    });
  }
}

module.exports = {
  register,
  login
};