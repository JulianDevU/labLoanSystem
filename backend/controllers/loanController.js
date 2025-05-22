import Prestamo from '../models/Loan.js';
import Equipo from '../models/Equipment.js';
import Usuario from '../models/User.js';
import Notificacion from '../models/Notification.js';
import { validationResult } from 'express-validator';
import { generarPDFPrestamo, generarReportePrestamos } from '../utils/generatePDF.js';
import { estaVencido, calcularDiasRestantes } from '../utils/helpers.js';

// @desc    Obtener todos los préstamos
// @route   GET /api/prestamos
// @access  Privado
export const getPrestamos = async (req, res) => {
  try {
    // Filtros
    const filtro = {};
    
    // Filtrar por estado si se proporciona
    if (req.query.estado && req.query.estado !== 'todos') {
      filtro.estado = req.query.estado;
    }
    
    // Filtrar por usuario si se proporciona
    if (req.query.usuario_id) {
      filtro.usuario_id = req.query.usuario_id;
    }
    
    // Filtrar por equipo si se proporciona
    if (req.query.equipo_id) {
      filtro.equipo_id = req.query.equipo_id;
    }
    
    // Filtrar por fechas si se proporcionan
    if (req.query.desde || req.query.hasta) {
      filtro.fecha_prestamo = {};
      if (req.query.desde) {
        filtro.fecha_prestamo.$gte = new Date(req.query.desde);
      }
      if (req.query.hasta) {
        filtro.fecha_prestamo.$lte = new Date(req.query.hasta);
      }
    }

    if (req.query.laboratorio_id) {
      // Obtener equipos del laboratorio
      const equipos = await Equipo.find({ laboratorio_id: req.query.laboratorio_id });
      const equiposIds = equipos.map(e => e._id);
      filtro.equipo_id = { $in: equiposIds };
    }
    
    // Si el usuario no es administrador, solo mostrar sus préstamos o los de su laboratorio
    if (req.usuario.tipo !== 'administrador') {
      if (req.query.todos === 'true' && req.usuario.laboratorio_id) {
        // Obtener todos los usuarios del laboratorio
        const usuarios = await Usuario.find({ laboratorio_id: req.usuario.laboratorio_id });
        const usuariosIds = usuarios.map(u => u._id);
        filtro.usuario_id = { $in: usuariosIds };
      } else {
        // Solo mostrar los préstamos del usuario
        filtro.usuario_id = req.usuario._id;
      }
    }
    
    // Buscar préstamos con filtros
    const prestamos = await Prestamo.find(filtro)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre'
        }
      })
      .sort({ fecha_prestamo: -1 });

    res.status(200).json({
      success: true,
      count: prestamos.length,
      data: prestamos
    });
  } catch (error) {
    console.error('Error en getPrestamos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener préstamos',
      error: error.message
    });
  }
};

// @desc    Obtener un préstamo por ID
// @route   GET /api/prestamos/:id
// @access  Privado
export const getPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Verificar si el usuario tiene permiso para ver este préstamo
    if (req.usuario.tipo !== 'administrador' && 
        prestamo.usuario_id._id.toString() !== req.usuario._id.toString() &&
        prestamo.equipo_id.laboratorio_id._id.toString() !== req.usuario.laboratorio_id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para ver este préstamo'
      });
    }

    res.status(200).json({
      success: true,
      data: prestamo
    });
  } catch (error) {
    console.error('Error en getPrestamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener préstamo',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo préstamo
// @route   POST /api/prestamos
// @access  Privado
export const crearPrestamo = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { usuario_id, equipo_id, fecha_devolucion } = req.body;

    // Verificar si existe el usuario
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar si existe el equipo
    const equipo = await Equipo.findById(equipo_id);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Equipo no encontrado'
      });
    }

    // Verificar si hay disponibilidad
    if (equipo.cantidad_disponible <= 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No hay unidades disponibles de este equipo'
      });
    }

    // Verificar si el usuario ya tiene un préstamo activo de este equipo
    const prestamoExistente = await Prestamo.findOne({
      usuario_id,
      equipo_id,
      estado: 'activo'
    });

    if (prestamoExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'El usuario ya tiene un préstamo activo de este equipo'
      });
    }

    // Crear préstamo
    const prestamo = await Prestamo.create({
      usuario_id,
      equipo_id,
      fecha_prestamo: new Date(),
      fecha_devolucion: new Date(fecha_devolucion),
      estado: 'activo'
    });

    // Actualizar disponibilidad del equipo
    equipo.cantidad_disponible -= 1;
    await equipo.save();

    // Crear notificación para el usuario
    await Notificacion.crearNotificacionPrestamo(
      usuario_id,
      equipo.nombre,
      new Date(fecha_devolucion)
    );

    // Obtener información completa del préstamo
    const prestamoCompleto = await Prestamo.findById(prestamo._id)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      });

    res.status(201).json({
      success: true,
      data: prestamoCompleto
    });
  } catch (error) {
    console.error('Error en crearPrestamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear préstamo',
      error: error.message
    });
  }
};

// @desc    Actualizar un préstamo
// @route   PUT /api/prestamos/:id
// @access  Privado
export const actualizarPrestamo = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verificar si existe el préstamo
    let prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Verificar si el usuario tiene permiso para actualizar este préstamo
    if (req.usuario.tipo !== 'administrador' && 
        prestamo.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para actualizar este préstamo'
      });
    }

    // Si se está devolviendo el equipo
    if (req.body.estado === 'devuelto' && prestamo.estado === 'activo') {
      // Actualizar disponibilidad del equipo
      const equipo = await Equipo.findById(prestamo.equipo_id);
      equipo.cantidad_disponible += 1;
      await equipo.save();

      // Establecer fecha de devolución real
      req.body.fecha_devolucion_real = new Date();
    }

    // Actualizar préstamo
    prestamo = await Prestamo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('usuario_id', 'nombre correo tipo')
     .populate({
       path: 'equipo_id',
       select: 'nombre descripcion categoria',
       populate: {
         path: 'laboratorio_id',
         select: 'nombre descripcion'
       }
     });

    res.status(200).json({
      success: true,
      data: prestamo
    });
  } catch (error) {
    console.error('Error en actualizarPrestamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar préstamo',
      error: error.message
    });
  }
};

// @desc    Eliminar un préstamo
// @route   DELETE /api/prestamos/:id
// @access  Privado/Admin
export const eliminarPrestamo = async (req, res) => {
  try {
    // Verificar si existe el préstamo
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Si el préstamo está activo, devolver el equipo al inventario
    if (prestamo.estado === 'activo') {
      const equipo = await Equipo.findById(prestamo.equipo_id);
      equipo.cantidad_disponible += 1;
      await equipo.save();
    }

    // Eliminar préstamo
    await prestamo.deleteOne();

    res.status(200).json({
      success: true,
      mensaje: 'Préstamo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en eliminarPrestamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar préstamo',
      error: error.message
    });
  }
};

// @desc    Generar PDF de préstamo
// @route   GET /api/prestamos/:id/pdf
// @access  Privado
export const generarPDF = async (req, res) => {
  try {
    // Verificar si existe el préstamo
    const prestamo = await Prestamo.findById(req.params.id)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Verificar si el usuario tiene permiso para ver este préstamo
    if (req.usuario.tipo !== 'administrador' && 
        prestamo.usuario_id._id.toString() !== req.usuario._id.toString() &&
        prestamo.equipo_id.laboratorio_id._id.toString() !== req.usuario.laboratorio_id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para ver este préstamo'
      });
    }

    // Generar PDF
    const pdf = await generarPDFPrestamo(
      prestamo,
      prestamo.usuario_id,
      prestamo.equipo_id,
      prestamo.equipo_id.laboratorio_id
    );

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/pdfs/${pdf.fileName}`,
        fileName: pdf.fileName
      }
    });
  } catch (error) {
    console.error('Error en generarPDF:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al generar PDF',
      error: error.message
    });
  }
};

// @desc    Generar reporte de préstamos
// @route   GET /api/prestamos/reporte
// @access  Privado/Admin
export const generarReporte = async (req, res) => {
  try {
    // Filtros
    const filtro = {};
    
    // Filtrar por estado si se proporciona
    if (req.query.estado && req.query.estado !== 'todos') {
      filtro.estado = req.query.estado;
    }
    
    // Filtrar por fechas si se proporcionan
    if (req.query.desde || req.query.hasta) {
      filtro.fecha_prestamo = {};
      if (req.query.desde) {
        filtro.fecha_prestamo.$gte = new Date(req.query.desde);
      }
      if (req.query.hasta) {
        filtro.fecha_prestamo.$lte = new Date(req.query.hasta);
      }
    }
    
    // Filtrar por laboratorio si se proporciona
    if (req.query.laboratorio_id) {
      // Obtener equipos del laboratorio
      const equipos = await Equipo.find({ laboratorio_id: req.query.laboratorio_id });
      const equiposIds = equipos.map(e => e._id);
      filtro.equipo_id = { $in: equiposIds };
    }
    
    // Buscar préstamos con filtros
    const prestamos = await Prestamo.find(filtro)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre'
        }
      })
      .sort({ fecha_prestamo: -1 });

    // Generar PDF
    const pdf = await generarReportePrestamos(prestamos);

    res.status(200).json({
      success: true,
      data: {
        url: `/uploads/pdfs/${pdf.fileName}`,
        fileName: pdf.fileName,
        count: prestamos.length
      }
    });
  } catch (error) {
    console.error('Error en generarReporte:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al generar reporte',
      error: error.message
    });
  }
};

// @desc    Verificar préstamos vencidos
// @route   GET /api/prestamos/verificar-vencidos
// @access  Privado/Admin
export const verificarVencidos = async (req, res) => {
  try {
    // Buscar préstamos activos
    const prestamosActivos = await Prestamo.find({ estado: 'activo' })
      .populate('usuario_id', 'nombre')
      .populate('equipo_id', 'nombre');

    let vencidos = 0;
    let porVencer = 0;

    // Verificar cada préstamo
    for (const prestamo of prestamosActivos) {
      // Verificar si está vencido
      if (estaVencido(prestamo.fecha_devolucion)) {
        // Marcar como vencido
        prestamo.estado = 'vencido';
        await prestamo.save();
        vencidos++;

        // Crear notificación de vencimiento
        await Notificacion.crearNotificacionVencimiento(
          prestamo.usuario_id._id,
          prestamo.equipo_id.nombre
        );
      } else {
        // Verificar si está por vencer (menos de 2 días)
        const diasRestantes = calcularDiasRestantes(prestamo.fecha_devolucion);
        if (diasRestantes <= 2) {
          porVencer++;

          // Crear notificación de recordatorio
          await Notificacion.crearRecordatorio(
            prestamo.usuario_id._id,
            prestamo.equipo_id.nombre,
            diasRestantes
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        vencidos,
        porVencer,
        total: prestamosActivos.length
      }
    });
  } catch (error) {
    console.error('Error en verificarVencidos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al verificar préstamos vencidos',
      error: error.message
    });
  }
};

export default {
  getPrestamos,
  getPrestamo,
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  generarPDF,
  generarReporte,
  verificarVencidos
};