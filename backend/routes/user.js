import express from 'express';
import {
  getUsuarios,
  getUsuario,
  getUsuarioAutenticado,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  crearUsuarioValidator,
  actualizarUsuarioValidator
} from '../utils/validators.js';

const router = express.Router();

router.post('/', crearUsuarioValidator, crearUsuario);

// Proteger todas las rutas
router.use(protect);

// Rutas para todos los usuarios
router.get('/me', getUsuarioAutenticado);
router.get('/:id', getUsuario);

// Rutas solo para administradores
router.get('/', authorize('administrador'), getUsuarios);
router.put('/:id', actualizarUsuarioValidator, actualizarUsuario);
router.delete('/:id', authorize('administrador'), eliminarUsuario);

export default router;