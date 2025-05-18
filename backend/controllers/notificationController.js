import Notificacion from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Obtener todas las notificaciones del usuario
// @route   GET /api/notificaciones
// @access  Privado
export const getNotificaciones = async (req, res) => {
  try {
    // Filtros
    const filtro = { usuario_id: req.usuario._id };
    
    // Filtrar por leído si se proporciona
    if (req.query.leido === 'true') {
      filtro.leido = true;
    } else if (req.query.leido === 'false') {
      filtro.leido = false;
    }
    
    // Buscar notificaciones con filtros
    const notificaciones = await Notificacion.find(filtro)
      .sort({ fecha: -1 });

    res.status(200).json({
      success: true,
      count: notificaciones.length,
      data: notificaciones
    });
  } catch (error) {
    console.error('Error en getNotificaciones:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

// @desc    Obtener una notificación por ID
// @route   GET /api/notificaciones/:id
// @access  Privado
export const getNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Notificación no encontrada'
      });
    }

    // Verificar si el usuario tiene permiso para ver esta notificación
    if (notificacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para ver esta notificación'
      });
    }

    res.status(200).json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    console.error('Error en getNotificacion:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener notificación',
      error: error.message
    });
  }
};

// @desc    Crear una nueva notificación
// @route   POST /api/notificaciones
// @access  Privado/Admin
export const crearNotificacion = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { usuario_id, mensaje } = req.body;

    // Crear notificación
    const notificacion = await Notificacion.create({
      usuario_id,
      mensaje,
      leido: false,
      fecha: new Date()
    });

    res.status(201).json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    console.error('Error en crearNotificacion:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear notificación',
      error: error.message
    });
  }
};

// @desc    Marcar notificación como leída
// @route   PUT /api/notificaciones/:id
// @access  Privado
export const marcarLeida = async (req, res) => {
  try {
    // Verificar si existe la notificación
    let notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Notificación no encontrada'
      });
    }

    // Verificar si el usuario tiene permiso para actualizar esta notificación
    if (notificacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para actualizar esta notificación'
      });
    }

    // Marcar como leída
    notificacion.leido = true;
    await notificacion.save();

    res.status(200).json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    console.error('Error en marcarLeida:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al marcar notificación como leída',
      error: error.message
    });
  }
};

// @desc    Marcar todas las notificaciones como leídas
// @route   PUT /api/notificaciones/marcar-todas-leidas
// @access  Privado
export const marcarTodasLeidas = async (req, res) => {
  try {
    // Actualizar todas las notificaciones no leídas del usuario
    const resultado = await Notificacion.updateMany(
      { usuario_id: req.usuario._id, leido: false },
      { leido: true }
    );

    res.status(200).json({
      success: true,
      mensaje: `${resultado.modifiedCount} notificaciones marcadas como leídas`
    });
  } catch (error) {
    console.error('Error en marcarTodasLeidas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
};

// @desc    Eliminar una notificación
// @route   DELETE /api/notificaciones/:id
// @access  Privado
export const eliminarNotificacion = async (req, res) => {
  try {
    // Verificar si existe la notificación
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Notificación no encontrada'
      });
    }

    // Verificar si el usuario tiene permiso para eliminar esta notificación
    if (notificacion.usuario_id.toString() !== req.usuario._id.toString() && 
        req.usuario.tipo !== 'administrador') {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para eliminar esta notificación'
      });
    }

    // Eliminar notificación
    await notificacion.deleteOne();

    res.status(200).json({
      success: true,
      mensaje: 'Notificación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarNotificacion:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar notificación',
      error: error.message
    });
  }
};

export default {
  getNotificaciones,
  getNotificacion,
  crearNotificacion,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion
};