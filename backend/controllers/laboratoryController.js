import Laboratorio from '../models/Laboratory.js';
import { validationResult } from 'express-validator';

// @desc    Obtener todos los laboratorios
// @route   GET /api/laboratorios
// @access  Privado
export const getLaboratorios = async (req, res) => {
  try {
    const laboratorios = await Laboratorio.find();

    res.status(200).json({
      success: true,
      count: laboratorios.length,
      data: laboratorios
    });
  } catch (error) {
    console.error('Error en getLaboratorios:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener laboratorios',
      error: error.message
    });
  }
};

// @desc    Obtener un laboratorio por ID
// @route   GET /api/laboratorios/:id
// @access  Privado
export const getLaboratorio = async (req, res) => {
  try {
    const laboratorio = await Laboratorio.findById(req.params.id);

    if (!laboratorio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Laboratorio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: laboratorio
    });
  } catch (error) {
    console.error('Error en getLaboratorio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener laboratorio',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo laboratorio
// @route   POST /api/laboratorios
// @access  Privado/Admin
export const crearLaboratorio = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;

    // Verificar si ya existe un laboratorio con el mismo nombre
    const laboratorioExistente = await Laboratorio.findOne({ nombre });
    if (laboratorioExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un laboratorio con ese nombre'
      });
    }

    // Crear laboratorio
    const laboratorio = await Laboratorio.create({
      nombre,
      descripcion
    });

    res.status(201).json({
      success: true,
      data: laboratorio
    });
  } catch (error) {
    console.error('Error en crearLaboratorio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear laboratorio',
      error: error.message
    });
  }
};

// @desc    Actualizar un laboratorio
// @route   PUT /api/laboratorios/:id
// @access  Privado/Admin
export const actualizarLaboratorio = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;

    // Verificar si existe el laboratorio
    let laboratorio = await Laboratorio.findById(req.params.id);
    if (!laboratorio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Laboratorio no encontrado'
      });
    }

    // Verificar si ya existe otro laboratorio con el mismo nombre
    if (nombre && nombre !== laboratorio.nombre) {
      const laboratorioExistente = await Laboratorio.findOne({ nombre });
      if (laboratorioExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un laboratorio con ese nombre'
        });
      }
    }

    // Actualizar laboratorio
    laboratorio = await Laboratorio.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: laboratorio
    });
  } catch (error) {
    console.error('Error en actualizarLaboratorio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar laboratorio',
      error: error.message
    });
  }
};

// @desc    Eliminar un laboratorio
// @route   DELETE /api/laboratorios/:id
// @access  Privado/Admin
export const eliminarLaboratorio = async (req, res) => {
  try {
    // Verificar si existe el laboratorio
    const laboratorio = await Laboratorio.findById(req.params.id);
    if (!laboratorio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Laboratorio no encontrado'
      });
    }

    // Eliminar laboratorio
    await laboratorio.deleteOne();

    res.status(200).json({
      success: true,
      mensaje: 'Laboratorio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarLaboratorio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar laboratorio',
      error: error.message
    });
  }
};

export default {
  getLaboratorios,
  getLaboratorio,
  crearLaboratorio,
  actualizarLaboratorio,
  eliminarLaboratorio
};