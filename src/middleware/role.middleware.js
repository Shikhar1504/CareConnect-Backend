const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorizeRoles;