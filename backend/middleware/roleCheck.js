exports.authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
        });
      }
      next();
    };
  };