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
    const filtro = {};

    if (req.query.estado && req.query.estado !== 'todos') {
      filtro.estado = req.query.estado;
    }

    if (req.query.equipo_id) {
      filtro['equipos.equipo_id'] = req.query.equipo_id;
    }

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
      filtro.laboratorio_id = req.query.laboratorio_id;
    }

    // Si el usuario no es administrador, aplicar filtros de permisos
    if (req.usuario.tipo !== 'administrador') {
      if (req.query.todos === 'true' && req.usuario.laboratorio_id) {
        filtro.laboratorio_id = req.usuario.laboratorio_id;
      } else {
        filtro.usuario_id = req.usuario._id;
      }
    }

    const prestamos = await Prestamo.find(filtro)
      .populate({
        path: 'equipos.equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre'
        }
      })
      .populate('laboratorio_id', 'nombre')
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
      .populate({
        path: 'equipos.equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      })
      .populate('laboratorio_id', 'nombre descripcion');

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      tipo_beneficiado,
      numero_identificacion,
      nombre_beneficiado,
      correo_beneficiado,
      equipos, // Ahora recibimos un array de equipos
      fecha_devolucion,
      evidencia_foto,
      laboratorio_id,
      descripcion
    } = req.body;

    // Validar que se hayan proporcionado equipos
    if (!equipos || !Array.isArray(equipos) || equipos.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe seleccionar al menos un equipo'
      });
    }

    // Verificar disponibilidad de todos los equipos
    const equiposData = [];
    for (const equipoItem of equipos) {
      const equipo = await Equipo.findById(equipoItem.equipo_id || equipoItem.id);
      
      if (!equipo) {
        return res.status(404).json({
          success: false,
          mensaje: `Equipo con ID ${equipoItem.equipo_id || equipoItem.id} no encontrado`
        });
      }

      const cantidadSolicitada = equipoItem.cantidad || equipoItem.quantity || 1;
      
      if (equipo.cantidad_disponible < cantidadSolicitada) {
        return res.status(400).json({
          success: false,
          mensaje: `No hay suficientes unidades disponibles del equipo "${equipo.nombre}". Disponibles: ${equipo.cantidad_disponible}, Solicitadas: ${cantidadSolicitada}`
        });
      }

      equiposData.push({
        equipo: equipo,
        cantidad: cantidadSolicitada
      });
    }

    // Crear el préstamo
    const prestamo = await Prestamo.create({
      tipo_beneficiado,
      numero_identificacion,
      nombre_beneficiado,
      correo_beneficiado,
      equipos: equiposData.map(item => ({
        equipo_id: item.equipo._id,
        cantidad: item.cantidad
      })),
      fecha_prestamo: new Date(),
      fecha_devolucion: new Date(fecha_devolucion),
      estado: 'activo',
      evidencia_foto,
      laboratorio_id,
      descripcion
    });

    // Actualizar la disponibilidad de todos los equipos
    for (const equipoData of equiposData) {
      equipoData.equipo.cantidad_disponible -= equipoData.cantidad;
      await equipoData.equipo.save();
    }

    // Obtener información completa del préstamo creado
    const prestamoCompleto = await Prestamo.findById(prestamo._id)
      .populate({
        path: 'equipos.equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      })
      .populate('laboratorio_id', 'nombre descripcion');

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let prestamo = await Prestamo.findById(req.params.id).populate('equipos.equipo_id');
    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Verificar permisos
    if (req.usuario.tipo !== 'administrador' &&
      prestamo.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para actualizar este préstamo'
      });
    }

    // Si se está devolviendo el equipo, restaurar inventario (ahora soporta devoluciones parciales)
    if (req.body.estado === 'devuelto' && prestamo.estado === 'activo') {
      const equiposDevueltos = req.body.equipos_devueltos || [];
      // Mapear cantidades devueltas por equipo
      const devueltosMap = new Map();
      for (const devuelto of equiposDevueltos) {
        devueltosMap.set(String(devuelto.equipo_id), devuelto.cantidad);
      }
      for (const equipoItem of prestamo.equipos) {
        const equipoId = String(equipoItem.equipo_id._id || equipoItem.equipo_id);
        const cantidadDevuelta = devueltosMap.has(equipoId) ? devueltosMap.get(equipoId) : equipoItem.cantidad;
        const cantidadPrestada = equipoItem.cantidad;
        const equipo = await Equipo.findById(equipoId);
        if (equipo) {
          // Sumar solo la cantidad devuelta al disponible
          equipo.cantidad_disponible += cantidadDevuelta;
          // Si no se devolvió todo, restar la diferencia del total
          if (cantidadDevuelta < cantidadPrestada) {
            equipo.cantidad_total -= (cantidadPrestada - cantidadDevuelta);
            if (equipo.cantidad_total < 0) equipo.cantidad_total = 0;
            if (equipo.cantidad_disponible > equipo.cantidad_total) equipo.cantidad_disponible = equipo.cantidad_total;
          }
          await equipo.save();
        }
      }
      req.body.fecha_devolucion_real = new Date();
      // Guardar cantidades devueltas y nota en el préstamo
      req.body.equipos_devueltos = equiposDevueltos;
      if (req.body.nota_devolucion) {
        prestamo.nota_devolucion = req.body.nota_devolucion;
      }
    }

    // Actualizar préstamo
    prestamo = await Prestamo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'equipos.equipo_id',
      select: 'nombre descripcion categoria',
      populate: {
        path: 'laboratorio_id',
        select: 'nombre descripcion'
      }
    }).populate('laboratorio_id', 'nombre descripcion');

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
    const prestamo = await Prestamo.findById(req.params.id).populate('equipos.equipo_id');
    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Si el préstamo está activo, devolver todos los equipos al inventario
    if (prestamo.estado === 'activo') {
      for (const equipoItem of prestamo.equipos) {
        const equipo = await Equipo.findById(equipoItem.equipo_id._id);
        if (equipo) {
          equipo.cantidad_disponible += equipoItem.cantidad;
          await equipo.save();
        }
      }
    }

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

// Resto de funciones sin cambios significativos...
export const generarPDF = async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipos.equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre descripcion'
        }
      })
      .populate('laboratorio_id', 'nombre descripcion');

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    // Verificar permisos
    if (req.usuario.tipo !== 'administrador' &&
      prestamo.usuario_id._id.toString() !== req.usuario._id.toString() &&
      prestamo.laboratorio_id._id.toString() !== req.usuario.laboratorio_id.toString()) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tienes permiso para ver este préstamo'
      });
    }

    const pdf = await generarPDFPrestamo(
      prestamo,
      prestamo.usuario_id,
      prestamo.equipos, // Ahora pasamos todos los equipos
      prestamo.laboratorio_id
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

export const generarReporte = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.estado && req.query.estado !== 'todos') {
      filtro.estado = req.query.estado;
    }

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
      filtro.laboratorio_id = req.query.laboratorio_id;
    }

    const prestamos = await Prestamo.find(filtro)
      .populate('usuario_id', 'nombre correo tipo')
      .populate({
        path: 'equipos.equipo_id',
        select: 'nombre descripcion categoria',
        populate: {
          path: 'laboratorio_id',
          select: 'nombre'
        }
      })
      .populate('laboratorio_id', 'nombre')
      .sort({ fecha_prestamo: -1 });

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

export const verificarVencidos = async (req, res) => {
  try {
    const prestamosActivos = await Prestamo.find({ estado: 'activo' })
      .populate('usuario_id', 'nombre')
      .populate('equipos.equipo_id', 'nombre');

    let vencidos = 0;
    let porVencer = 0;

    for (const prestamo of prestamosActivos) {
      if (estaVencido(prestamo.fecha_devolucion)) {
        prestamo.estado = 'vencido';
        await prestamo.save();
        vencidos++;

        // Crear notificación de vencimiento para cada equipo
        for (const equipoItem of prestamo.equipos) {
          await Notificacion.crearNotificacionVencimiento(
            prestamo.usuario_id._id,
            equipoItem.equipo_id.nombre
          );
        }
      } else {
        const diasRestantes = calcularDiasRestantes(prestamo.fecha_devolucion);
        if (diasRestantes <= 2) {
          porVencer++;

          // Crear recordatorio para cada equipo
          for (const equipoItem of prestamo.equipos) {
            await Notificacion.crearRecordatorio(
              prestamo.usuario_id._id,
              equipoItem.equipo_id.nombre,
              diasRestantes
            );
          }
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