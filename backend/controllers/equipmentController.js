const Equipment = require('../models/Equipment');

// @desc    Obtener todos los equipos
// @route   GET /api/equipment
// @access  Public
exports.getEquipment = async (req, res) => {
  try {
    // Construir la consulta
    let query = Equipment.find();

    // Filtrado
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Filtrar por campos
    if (Object.keys(reqQuery).length > 0) {
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      query = Equipment.find(JSON.parse(queryStr));
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
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Equipment.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Ejecutar la consulta
    const equipment = await query;

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
      count: equipment.length,
      pagination,
      data: equipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener un equipo
// @route   GET /api/equipment/:id
// @access  Public
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Crear un equipo
// @route   POST /api/equipment
// @access  Private/Admin/Lab_Assistant
exports.createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Actualizar un equipo
// @route   PUT /api/equipment/:id
// @access  Private/Admin/Lab_Assistant
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Eliminar un equipo
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipo no encontrado'
      });
    }

    await equipment.deleteOne();

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