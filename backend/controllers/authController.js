import Usuario from '../models/User.js';
import { validationResult } from 'express-validator';
import { generarToken } from '../utils/helpers.js';

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
export const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { correo, contrasena } = req.body;

    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña (asegurar comparación estricta y await)
    const esContrasenaCorrecta = await usuario.verificarContrasena(contrasena);
    if (!esContrasenaCorrecta) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generarToken(usuario._id);

    // Enviar respuesta
    res.status(200).json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
        laboratorio_id: usuario.laboratorio_id
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/perfil
// @access  Privado
export const getPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select('-contrasena');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      usuario
    });
  } catch (error) {
    console.error('Error en getPerfil:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/cambiar-contrasena
// @access  Privado
export const cambiarContrasena = async (req, res) => {
  try {
    const { contrasenaActual, nuevaContrasena } = req.body;

    // Validar datos
    if (!contrasenaActual || !nuevaContrasena) {
      return res.status(400).json({
        success: false,
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        success: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findById(req.usuario._id);

    // Verificar contraseña actual
    const esContrasenaCorrecta = await usuario.verificarContrasena(contrasenaActual);
    if (!esContrasenaCorrecta) {
      return res.status(401).json({
        success: false,
        mensaje: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.contrasena = nuevaContrasena;
    await usuario.save();

    res.status(200).json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error en cambiarContrasena:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

export default { login, getPerfil, cambiarContrasena };