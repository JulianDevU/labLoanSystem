import express from 'express';
import { login, getPerfil, cambiarContrasena } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginValidator } from '../utils/validators.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginValidator, login);

// Rutas protegidas
router.get('/perfil', protect, getPerfil);
router.put('/cambiar-contrasena', protect, cambiarContrasena);

export default router;