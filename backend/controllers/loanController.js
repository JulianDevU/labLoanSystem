const Loan = require('../models/Loan');
const Equipment = require('../models/Equipment');
const generatePDF = require('../utils/generatePDF');

// @desc    Obtener todos los préstamos
// @route   GET /api/loans
// @access  Private/Admin/Lab_Assistant
exports.getLoans = async (req, res) => {
  try {
    // Filtrar por usuario si es un estudiante
    let filter = {};
    if (req.user.role === 'student') {
      filter.user = req.user.id;
    }

    // Construir la consulta
    let query = Loan.find(filter)
      .populate({
        path: 'equipment',
        select: 'name code category'
      })
      .populate({
        path: 'user',
        select: 'name email documentId'
      })
      .populate({
        path: 'authorizedBy',
        select: 'name role'
      });

    // Filtrado avanzado
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    if (Object.keys(reqQuery).length > 0) {
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      
      // Combinar con filtro de usuario
      const parsedQuery = JSON.parse(queryStr);
      query = Loan.find({ ...filter, ...parsedQuery })
        .populate({
          path: 'equipment',
          select: 'name code category'
        })
        .populate({
          path: 'user',
          select: 'name email documentId'
        })
        .populate({
          path: 'authorizedBy',
          select: 'name role'
        });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-loanDate');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Loan.countDocuments(filter);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const loans = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: loans.length,
      pagination,
      data: loans
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener un préstamo
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate({
        path: 'equipment',
        select: 'name code category description'
      })
      .populate({
        path: 'user',
        select: 'name email documentId'
      })
      .populate({
        path: 'authorizedBy',
        select: 'name role'
      });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    // Verificar acceso (sólo admin, lab_assistant o el propio usuario)
    if (req.user.role === 'student' && loan.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para ver este préstamo'
      });
    }

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Crear un préstamo
// @route   POST /api/loans
// @access  Private/Admin/Lab_Assistant
exports.createLoan = async (req, res) => {
  try {
    // Verificar disponibilidad del equipo
    const equipment = await Equipment.findById(req.body.equipment);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado'
      });
    }

    if (equipment.available < req.body.quantity) {
      return res.status(400).json({
        success: false,
        error: `No hay suficientes unidades disponibles. Solo hay ${equipment.available} disponibles.`
      });
    }

    // Agregar quien autoriza el préstamo (el usuario actual)
    req.body.authorizedBy = req.user.id;

    // Crear el préstamo
    const loan = await Loan.create(req.body);

    // Actualizar la cantidad disponible del equipo
    equipment.available -= req.body.quantity;
    await equipment.save();

    // Generar recibo PDF
    const pdfBuffer = await generatePDF(loan, equipment, req.body.user);

    // Devolver la respuesta
    res.status(201).json({
      success: true,
      data: loan,
      pdfBuffer: pdfBuffer.toString('base64')
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Actualizar un préstamo
// @route   PUT /api/loans/:id
// @access  Private/Admin/Lab_Assistant
exports.updateLoan = async (req, res) => {
  try {
    let loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    // No permitir cambiar el equipo o la cantidad en un préstamo existente
    const protectedFields = ['equipment', 'quantity', 'user', 'authorizedBy'];
    protectedFields.forEach(field => {
      if (req.body[field]) {
        delete req.body[field];
      }
    });

    // Actualizar el préstamo
    loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Si el estado cambia a "returned", actualizar la cantidad disponible
    if (req.body.status === 'returned' && loan.status === 'returned' && !loan.returnDate) {
      const equipment = await Equipment.findById(loan.equipment);
      equipment.available += loan.quantity;
      await equipment.save();
      
      // Actualizar fecha de devolución
      loan.returnDate = Date.now();
      await loan.save();
    }

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Procesar devolución de préstamo
// @route   PUT /api/loans/:id/return
// @access  Private/Admin/Lab_Assistant
exports.returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({
        success: false,
        error: 'Este préstamo ya ha sido devuelto'
      });
    }

    // Actualizar estado del préstamo
    loan.status = 'returned';
    loan.returnDate = Date.now();
    loan.comments = req.body.comments || loan.comments;
    
    await loan.save();

    // Actualizar la cantidad disponible del equipo
    const equipment = await Equipment.findById(loan.equipment);
    equipment.available += loan.quantity;
    await equipment.save();

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Eliminar un préstamo
// @route   DELETE /api/loans/:id
// @access  Private/Admin
exports.deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }
    
    // Si el préstamo está activo, restaurar cantidad disponible
    if (loan.status === 'active') {
      const equipment = await Equipment.findById(loan.equipment);
      equipment.available += loan.quantity;
      await equipment.save();
    }
    
    await loan.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Generar reporte de préstamos
// @route   GET /api/loans/report
// @access  Private/Admin/Lab_Assistant
exports.getLoansReport = async (req, res) => {
  try {
    // Obtener estadísticas de préstamos
    const stats = await Loan.aggregate([
      {
        $group: {
          _id: { 
            equipment: '$equipment',
            status: '$status' 
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id.equipment',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      {
        $unwind: '$equipmentDetails'
      },
      {
        $project: {
          _id: 0,
          equipment: '$equipmentDetails.name',
          equipmentCode: '$equipmentDetails.code',
          status: '$_id.status',
          count: 1,
          totalQuantity: 1
        }
      },
      {
        $sort: { equipment: 1, status: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Exportar préstamos a PDF
// @route   GET /api/loans/export
// @access  Private/Admin/Lab_Assistant
exports.exportLoans = async (req, res) => {
  try {
    // Filtrar por rango de fechas si se proporciona
    let filter = {};
    
    if (req.query.startDate && req.query.endDate) {
      filter.loanDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const loans = await Loan.find(filter)
      .populate({
        path: 'equipment',
        select: 'name code category'
      })
      .populate({
        path: 'user',
        select: 'name email documentId'
      })
      .populate({
        path: 'authorizedBy',
        select: 'name role'
      })
      .sort('-loanDate');
      
    // Generar PDF con todos los préstamos
    const pdfBuffer = await generatePDF.generateLoansReport(loans);
    
    res.status(200).json({
      success: true,
      data: pdfBuffer.toString('base64')
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};