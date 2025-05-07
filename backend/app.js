const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Archivos de rutas
const auth = require('./routes/auth');
const users = require('./routes/user');
const equipment = require('./routes/equipment');
const loans = require('./routes/loan');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Logging de desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100
});
app.use(limiter);

// Prevenir http param pollution
app.use(hpp());

// Habilitar CORS
app.use(cors());

// Establecer carpeta estática
app.use(express.static(path.join(__dirname, 'public')));

// Montar rutas
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/equipment', equipment);
app.use('/api/loans', loans);

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta de verificación
app.get('/', (req, res) => {
  res.send('API de Sistema de Laboratorio de Física funcionando correctamente');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Servidor corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`.yellow.bold
  )
);

// Manejo de rechazo de promesa no controlada
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Cerrar servidor y salir del proceso
  server.close(() => process.exit(1));
});

module.exports = app;