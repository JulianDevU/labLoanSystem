import express from 'express';
import {
  getLaboratorios,
  getLaboratorio,
  crearLaboratorio,
  actualizarLaboratorio,
  eliminarLaboratorio
} from '../controllers/laboratoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  crearLaboratorioValidator,
  actualizarLaboratorioValidator
} from '../utils/validators.js';

const router = express.Router();

router.post('/', crearLaboratorioValidator, crearLaboratorio);

// Proteger todas las rutas
router.use(protect);

// Rutas para todos los usuarios
router.get('/', getLaboratorios);
router.get('/:id', getLaboratorio);

// Rutas solo para administradores
router.put('/:id', authorize('administrador'), actualizarLaboratorioValidator, actualizarLaboratorio);
router.delete('/:id', authorize('administrador'), eliminarLaboratorio);

export default router;