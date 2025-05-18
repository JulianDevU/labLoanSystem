// Middleware para manejar rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para manejar errores
export const errorHandler = (err, req, res, next) => {
  // Si el status code es 200, cambiarlo a 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Configurar el status code
  res.status(statusCode);
  
  // Enviar respuesta de error
  res.json({
    success: false,
    mensaje: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default { notFound, errorHandler };