import Usuario from '../models/User.js';
import Laboratorio from '../models/Laboratory.js';
import { validationResult } from 'express-validator';

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Privado/Admin
export const getUsuarios = async (req, res) => {
  try {
    // Filtros
    const filtro = {};
    
    // Filtrar por tipo si se proporciona
    if (req.query.tipo) {
      filtro.tipo = req.query.tipo;
    }
    
    // Filtrar por laboratorio si se proporciona
    if (req.query.laboratorio_id) {
      filtro.laboratorio_id = req.query.laboratorio_id;
    }
    
    // Si el usuario no es administrador, solo mostrar usuarios de su laboratorio
    if (req.usuario.tipo !== 'administrador') {
      filtro.laboratorio_id = req.usuario.laboratorio_id;
    }
    
    // Buscar usuarios con filtros
    const usuarios = await Usuario.find(filtro)
      .select('-contrasena')
      .populate('laboratorio_id', 'nombre');

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
    const usuario = await Usuario.findById(req.params.id)
      .select('-contrasena')
      .populate('laboratorio_id', 'nombre descripcion');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene permiso para ver este usuario
    if (req.usuario.tipo !== 'administrador' && 
        usuario._id.toString() !== req.usuario._id.toString() &&
        usuario.laboratorio_id._id.toString() !== req.usuario.laboratorio_id.toString()) {
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
// @access  Privado/Admin
export const crearUsuario = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, correo, contrasena, tipo, laboratorio_id } = req.body;

    // Verificar si ya existe un usuario con el mismo correo
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un usuario con ese correo electrónico'
      });
    }

    // Verificar si existe el laboratorio
    const laboratorio = await Laboratorio.findById(laboratorio_id);
    if (!laboratorio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Laboratorio no encontrado'
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena,
      tipo,
      laboratorio_id
    });

    // Excluir contraseña de la respuesta
    const usuarioResponse = {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo: usuario.tipo,
      laboratorio_id: usuario.laboratorio_id
    };

    res.status(201).json({
      success: true,
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

// @desc    Actualizar un usuario
// @route   PUT /api/usuarios/:id
// @access  Privado
export const actualizarUsuario = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verificar si existe el usuario
    let usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene permiso para actualizar este usuario
    if (req.usuario.tipo !== 'administrador' && 
        usuario._id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para actualizar este usuario'
      });
    }

    // Si se cambia el correo, verificar que no exista otro con el mismo correo
    if (req.body.correo && req.body.correo !== usuario.correo) {
      const usuarioExistente = await Usuario.findOne({ correo: req.body.correo });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un usuario con ese correo electrónico'
        });
      }
    }

    // Si se cambia el laboratorio, verificar que exista
    if (req.body.laboratorio_id && req.body.laboratorio_id !== usuario.laboratorio_id.toString()) {
      const laboratorio = await Laboratorio.findById(req.body.laboratorio_id);
      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          mensaje: 'Laboratorio no encontrado'
        });
      }
    }

    // No permitir que un usuario normal cambie su tipo
    if (req.usuario.tipo !== 'administrador' && req.body.tipo && req.body.tipo !== usuario.tipo) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para cambiar el tipo de usuario'
      });
    }

    // Actualizar usuario
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
    // Verificar si existe el usuario
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // No permitir que un usuario se elimine a sí mismo
    if (usuario._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        mensaje: 'No puedes eliminar tu propio usuario'
      });
    }

    // Eliminar usuario
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
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};