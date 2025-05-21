import Equipo from '../models/Equipment.js';
import Laboratorio from '../models/Laboratory.js';
import { validationResult } from 'express-validator';

// @desc    Obtener todos los equipos
// @route   GET /api/equipos
// @access  Privado
export const getEquipos = async (req, res) => {
  try {
    const filtro = {};
    
    if (req.query.laboratorio_id) {
      filtro.laboratorio_id = req.query.laboratorio_id;
    }
    
    if (req.query.categoria) {
      filtro.categoria = req.query.categoria;
    }
    
    if (req.query.disponible === 'true') {
      filtro.cantidad_disponible = { $gt: 0 };
    } else if (req.query.disponible === 'false') {
      filtro.cantidad_disponible = 0;
    }
    
    const equipos = await Equipo.find(filtro)
      .populate('laboratorio_id', 'nombre descripcion');

    res.status(200).json({
      success: true,
      count: equipos.length,
      data: equipos
    });
  } catch (error) {
    console.error('Error en getEquipos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener equipos',
      error: error.message
    });
  }
};

// @desc    Obtener un equipo por ID
// @route   GET /api/equipos/:id
// @access  Privado
export const getEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id)
      .populate('laboratorio_id', 'nombre descripcion');

    if (!equipo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: equipo
    });
  } catch (error) {
    console.error('Error en getEquipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener equipo',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo equipo
// @route   POST /api/equipos
// @access  Privado/Admin
export const crearEquipo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      nombre,
      descripcion,
      categoria,
      cantidad_total,
      cantidad_disponible,
      laboratorio_id,
      numero_serie,
      ubicacion,
      nota_adicional
    } = req.body;

    const laboratorio = await Laboratorio.findById(laboratorio_id);
    if (!laboratorio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Laboratorio no encontrado'
      });
    }

    const equipoExistente = await Equipo.findOne({
      nombre,
      laboratorio_id
    });
    
    if (equipoExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un equipo con ese nombre en este laboratorio'
      });
    }

    const equipo = await Equipo.create({
      nombre,
      descripcion,
      categoria,
      cantidad_total,
      cantidad_disponible,
      laboratorio_id,
      numero_serie,
      ubicacion,
      nota_adicional
    });

    res.status(201).json({
      success: true,
      data: equipo
    });
  } catch (error) {
    console.error('Error en crearEquipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear equipo',
      error: error.message
    });
  }
};

// @desc    Actualizar un equipo
// @route   PUT /api/equipos/:id
// @access  Privado/Admin
export const actualizarEquipo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let equipo = await Equipo.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    if (req.body.laboratorio_id && req.body.laboratorio_id !== equipo.laboratorio_id.toString()) {
      const laboratorio = await Laboratorio.findById(req.body.laboratorio_id);
      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          mensaje: 'Laboratorio no encontrado'
        });
      }
    }

    if (req.body.nombre && req.body.nombre !== equipo.nombre) {
      const laboratorioId = req.body.laboratorio_id || equipo.laboratorio_id;
      const equipoExistente = await Equipo.findOne({
        nombre: req.body.nombre,
        laboratorio_id: laboratorioId
      });
      
      if (equipoExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un equipo con ese nombre en este laboratorio'
        });
      }
    }

    equipo = await Equipo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: equipo
    });
  } catch (error) {
    console.error('Error en actualizarEquipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar equipo',
      error: error.message
    });
  }
};

// @desc    Eliminar un equipo
// @route   DELETE /api/equipos/:id
// @access  Privado/Admin
export const eliminarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    await equipo.deleteOne();

    res.status(200).json({
      success: true,
      mensaje: 'Equipo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarEquipo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar equipo',
      error: error.message
    });
  }
};

// @desc    Obtener categorías de equipos
// @route   GET /api/equipos/categorias
// @access  Privado
export const getCategorias = async (req, res) => {
  try {
    const categorias = await Equipo.distinct('categoria');

    res.status(200).json({
      success: true,
      count: categorias.length,
      data: categorias
    });
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener categorías',
      error: error.message
    });
  }
};

export default {
  getEquipos,
  getEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  getCategorias
};
