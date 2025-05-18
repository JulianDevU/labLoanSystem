import { body, param, query } from 'express-validator';

// Validadores para autenticación
export const loginValidator = [
  body('correo')
    .isEmail()
    .withMessage('Ingrese un correo electrónico válido'),
  body('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validadores para usuarios
export const crearUsuarioValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('correo')
    .isEmail()
    .withMessage('Ingrese un correo electrónico válido'),
  body('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('tipo')
    .isIn(['personal', 'administrador'])
    .withMessage('El tipo debe ser personal o administrador'),
];

export const actualizarUsuarioValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('nombre')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('correo')
    .optional()
    .isEmail()
    .withMessage('Ingrese un correo electrónico válido'),
  body('tipo')
    .optional()
    .isIn(['personal', 'administrador'])
    .withMessage('El tipo debe ser personal o administrador'),
];

// Validadores para laboratorios
export const crearLaboratorioValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
];

export const actualizarLaboratorioValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de laboratorio inválido'),
  body('nombre')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
];

// Validadores para equipos
export const crearEquipoValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía'),
  body('categoria')
    .notEmpty()
    .withMessage('La categoría es obligatoria'),
  body('cantidad_total')
    .isInt({ min: 0 })
    .withMessage('La cantidad total debe ser un número entero no negativo'),
  body('cantidad_disponible')
    .isInt({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número entero no negativo')
    .custom((value, { req }) => {
      if (value > req.body.cantidad_total) {
        throw new Error('La cantidad disponible no puede ser mayor que la cantidad total');
      }
      return true;
    }),
];

export const actualizarEquipoValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de equipo inválido'),
  body('nombre')
    .optional()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('descripcion')
    .optional()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía'),
  body('categoria')
    .optional()
    .notEmpty()
    .withMessage('La categoría no puede estar vacía'),
  body('cantidad_total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad total debe ser un número entero no negativo'),
  body('cantidad_disponible')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número entero no negativo')
];

// Validadores para préstamos
export const crearPrestamoValidator = [
  body('usuario_id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('equipo_id')
    .isMongoId()
    .withMessage('ID de equipo inválido'),
  body('fecha_devolucion')
    .isISO8601()
    .withMessage('Fecha de devolución inválida')
    .custom((value) => {
      const fechaDevolucion = new Date(value);
      const fechaActual = new Date();
      if (fechaDevolucion <= fechaActual) {
        throw new Error('La fecha de devolución debe ser posterior a la fecha actual');
      }
      return true;
    })
];

export const actualizarPrestamoValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de préstamo inválido'),
  body('estado')
    .optional()
    .isIn(['activo', 'devuelto', 'vencido'])
    .withMessage('El estado debe ser activo, devuelto o vencido'),
  body('fecha_devolucion_real')
    .optional()
    .isISO8601()
    .withMessage('Fecha de devolución real inválida')
];

// Validadores para notificaciones
export const crearNotificacionValidator = [
  body('usuario_id')
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  body('mensaje')
    .notEmpty()
    .withMessage('El mensaje es obligatorio')
];

export const actualizarNotificacionValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID de notificación inválido'),
  body('leido')
    .isBoolean()
    .withMessage('El campo leído debe ser un booleano')
];

// Validadores para filtros
export const filtroPrestamoValidator = [
  query('estado')
    .optional()
    .isIn(['activo', 'devuelto', 'vencido', 'todos'])
    .withMessage('Estado inválido'),
  query('desde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida'),
  query('hasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida'),
  query('usuario_id')
    .optional()
    .isMongoId()
    .withMessage('ID de usuario inválido'),
  query('equipo_id')
    .optional()
    .isMongoId()
    .withMessage('ID de equipo inválido')
];

export default {
  loginValidator,
  crearUsuarioValidator,
  actualizarUsuarioValidator,
  crearLaboratorioValidator,
  actualizarLaboratorioValidator,
  crearEquipoValidator,
  actualizarEquipoValidator,
  crearPrestamoValidator,
  actualizarPrestamoValidator,
  crearNotificacionValidator,
  actualizarNotificacionValidator,
  filtroPrestamoValidator
};
