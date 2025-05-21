import Usuario from '../models/User.js';
import { validationResult } from 'express-validator';
import { generarToken } from '../utils/helpers.js';

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Privado/Admin
export const getUsuarios = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.tipo) {
      filtro.tipo = req.query.tipo;
    }

    // Buscar usuarios con filtros
    const usuarios = await Usuario.find(filtro).select('-contrasena');

    res.status(200).json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Privado
export const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    if (
      req.usuario.tipo !== 'administrador' &&
      usuario._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para ver este usuario'
      });
    }

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error en getUsuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/usuarios
// @access  Privado/Admin (o público si es auto-registro)
export const crearUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, correo, contrasena, tipo } = req.body;

    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un usuario con ese correo electrónico'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena,
      tipo
    });

    const token = generarToken(usuario._id);

    const usuarioResponse = {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo: usuario.tipo
    };

    res.status(201).json({
      success: true,
      token,
      data: usuarioResponse
    });
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear usuario',
      error: error.message
    });
  }
};

// @desc    Obtener el usuario autenticado
// @route   GET /api/usuarios/me
// @access  Privado
export const getUsuarioAutenticado = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select("-contrasena")

    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: "Usuario no encontrado" })
    }

    res.status(200).json({ success: true, data: usuario })
  } catch (error) {
    console.error("Error en getUsuarioAutenticado:", error)
    res.status(500).json({ success: false, mensaje: "Error al obtener usuario" })
  }
}


// @desc    Actualizar un usuario
// @route   PUT /api/usuarios/:id
// @access  Privado
export const actualizarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    if (
      req.usuario.tipo !== 'administrador' &&
      usuario._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para actualizar este usuario'
      });
    }

    if (req.body.correo && req.body.correo !== usuario.correo) {
      const usuarioExistente = await Usuario.findOne({ correo: req.body.correo });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un usuario con ese correo electrónico'
        });
      }
    }

    if (
      req.usuario.tipo !== 'administrador' &&
      req.body.tipo &&
      req.body.tipo !== usuario.tipo
    ) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para cambiar el tipo de usuario'
      });
    }

    usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-contrasena');

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/usuarios/:id
// @access  Privado/Admin
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    if (usuario._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        mensaje: 'No puedes eliminar tu propio usuario'
      });
    }

    await usuario.deleteOne();

    res.status(200).json({
      success: true,
      mensaje: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

export default {
  getUsuarios,
  getUsuario,
  getUsuarioAutenticado,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
