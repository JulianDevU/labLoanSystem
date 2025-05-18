// Middleware para verificar si el usuario es administrador
export const esAdministrador = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === 'administrador') {
    next();
  } else {
    res.status(403).json({
      success: false,
      mensaje: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
};

// Middleware para verificar si el usuario pertenece al mismo laboratorio
export const mismoLaboratorio = (req, res, next) => {
  // Si es administrador, permitir acceso
  if (req.usuario.tipo === 'administrador') {
    return next();
  }

  // Verificar si el laboratorio_id coincide
  const laboratorioId = req.params.laboratorioId || req.body.laboratorio_id;
  
  if (laboratorioId && req.usuario.laboratorio_id.toString() === laboratorioId.toString()) {
    next();
  } else {
    res.status(403).json({
      success: false,
      mensaje: 'Acceso denegado. No tienes permisos para este laboratorio'
    });
  }
};

// Middleware para verificar si el usuario es propietario del recurso
export const esPropietario = (req, res, next) => {
  const usuarioId = req.params.usuarioId || req.body.usuario_id;
  
  if (req.usuario.tipo === 'administrador' || 
      (usuarioId && req.usuario._id.toString() === usuarioId.toString())) {
    next();
  } else {
    res.status(403).json({
      success: false,
      mensaje: 'Acceso denegado. No eres el propietario de este recurso'
    });
  }
};

export default { esAdministrador, mismoLaboratorio, esPropietario };