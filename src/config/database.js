const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear base de datos en archivo
const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath);

/**
 * Inicializa la base de datos y crea la tabla de usuarios si no existe
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Crear tabla de usuarios
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error al crear tabla:', err);
        reject(err);
      } else {
        console.log('✅ Base de datos inicializada correctamente');
        resolve();
      }
    });
  });
}

/**
 * Busca un usuario por nombre de usuario
 * @param {string} usuario - Nombre de usuario
 * @returns {Promise} Usuario encontrado o null
 */
function findUserByUsername(usuario) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM usuarios WHERE usuario = ?';
    
    db.get(query, [usuario], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Crea un nuevo usuario en la base de datos
 * @param {string} usuario - Nombre de usuario
 * @param {string} contraseñaHash - Contraseña encriptada
 * @returns {Promise} Usuario creado
 */
function createUser(usuario, contraseñaHash) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO usuarios (usuario, contraseña) VALUES (?, ?)';
    
    db.run(query, [usuario, contraseñaHash], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          usuario: usuario
        });
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  findUserByUsername,
  createUser
};