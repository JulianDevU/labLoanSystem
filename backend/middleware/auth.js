import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

// Middleware para proteger rutas
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si hay token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'No estás autorizado para acceder a este recurso'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'El usuario ya no existe'
      });
    }

    // Agregar el usuario a la solicitud
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      mensaje: 'No estás autorizado para acceder a este recurso'
    });
  }
};

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.tipo)) {
      return res.status(403).json({
        success: false,
        mensaje: `El rol ${req.usuario.tipo} no está autorizado para realizar esta acción`
      });
    }
    next();
  };
};

export default { protect, authorize };