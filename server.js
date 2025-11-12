const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const { initDatabase } = require('./src/config/database');

// Crear instancia de Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Permitir peticiones desde cualquier origen
app.use(express.json()); // Parsear body en formato JSON
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servicio Web de Autenticación - API REST',
    version: '1.0.0',
    endpoints: {
      registro: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// Montar rutas de autenticación
app.use('/api/auth', authRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message
  });
});

// Inicializar base de datos y arrancar servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('=================================');
    });
  })
  .catch((error) => {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  });