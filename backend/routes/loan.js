import express from 'express';
import {
  getPrestamos,
  getPrestamo,
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  generarPDF,
  generarReporte,
  verificarVencidos
} from '../controllers/loanController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  crearPrestamoValidator,
  actualizarPrestamoValidator,
  filtroPrestamoValidator
} from '../utils/validators.js';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas para todos los usuarios
router.get('/', filtroPrestamoValidator, getPrestamos);
router.get('/:id', getPrestamo);
router.get('/:id/pdf', generarPDF);
router.post('/', crearPrestamoValidator, crearPrestamo);
router.put('/:id', actualizarPrestamoValidator, actualizarPrestamo);

// Rutas solo para administradores
router.delete('/:id', authorize('administrador'), eliminarPrestamo);
router.get('/reporte/generar', authorize('administrador'), generarReporte);
router.get('/sistema/verificar-vencidos', authorize('administrador'), verificarVencidos);

export default router;