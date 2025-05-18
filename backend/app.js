import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/auth.js';
import laboratorioRoutes from './routes/laboratory.js';
import equipoRoutes from './routes/equipment.js';
import prestamoRoutes from './routes/loan.js';
import usuarioRoutes from './routes/user.js';
import notificacionRoutes from './routes/notification.js';

// Importar middleware de errores
import { errorHandler, notFound } from './middleware/error.js';

// Configuración de variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Configuración para archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/laboratorios', laboratorioRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Préstamos de Laboratorio' });
});

// Middleware para manejo de rutas no encontradas
app.use(notFound);

// Middleware para manejo de errores
app.use(errorHandler);

export default app;