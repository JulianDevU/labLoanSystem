const { body, validationResult } = require('express-validator');

// Validaciones para creación/actualización de usuario
exports.validateUser = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),
  
  body('documentId')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El número de documento es requerido')
    .isLength({ min: 5, max: 20 })
    .withMessage('El documento debe tener entre 5 y 20 caracteres'),
  
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['student', 'lab_assistant', 'admin'])
    .withMessage('Rol no válido')
];

// Validaciones para creación/actualización de equipo
exports.validateEquipment = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  
  body('code')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El código es requerido')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El código debe contener solo letras mayúsculas, números y guiones'),
  
  body('category')
    .isIn(['mechanic', 'electric', 'electronic', 'optic', 'lab', 'other'])
    .withMessage('Categoría no válida'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero no negativo'),
  
  body('available')
    .isInt({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número entero no negativo'),
  
  body('location')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La ubicación es requerida')
];

// Validaciones para creación de préstamo
exports.validateLoan = [
  body('equipment')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El ID del equipo es requerido')
    .isMongoId()
    .withMessage('ID de equipo no válido'),
  
  body('user')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El ID del usuario es requerido')
    .isMongoId()
    .withMessage('ID de usuario no válido'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser al menos 1'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Fecha de devolución no válida')
    .custom((value) => {
      const dueDate = new Date(value);
      const now = new Date();
      if (dueDate <= now) {
        throw new Error('La fecha de devolución debe ser posterior a la fecha actual');
      }
      return true;
    })
];

// Middleware para verificar resultados de validación
exports.checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Validación de login
exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La contraseña es requerida')
];

// Validación para actualización de contraseña
exports.validatePasswordUpdate = [
  body('currentPassword')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];