import express from 'express';
import {
  getEquipos,
  getEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  getCategorias
} from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  crearEquipoValidator,
  actualizarEquipoValidator
} from '../utils/validators.js';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas para todos los usuarios
router.get('/', getEquipos);
router.get('/categorias', getCategorias);
router.get('/:id', getEquipo);

// Rutas solo para administradores
router.post('/', authorize('administrador'), crearEquipoValidator, crearEquipo);
router.put('/:id', authorize('administrador'), actualizarEquipoValidator, actualizarEquipo);
router.delete('/:id', authorize('administrador'), eliminarEquipo);

export default router;