import express from 'express';
import {
  getNotificaciones,
  getNotificacion,
  crearNotificacion,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  crearNotificacionValidator,
  actualizarNotificacionValidator
} from '../utils/validators.js';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas para todos los usuarios
router.get('/', getNotificaciones);
router.get('/:id', getNotificacion);
router.put('/:id', actualizarNotificacionValidator, marcarLeida);
router.put('/', marcarTodasLeidas);
router.delete('/:id', eliminarNotificacion);

// Rutas solo para administradores
router.post('/', authorize('administrador'), crearNotificacionValidator, crearNotificacion);

export default router;