const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

class AuthMiddleware {
  // Protect routes - require authentication
  static async protect(req, res, next) {
    try {
      let token;

      // Check for token in headers
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authorized to access this route. Please login.'
        });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token and populate role
        req.user = await User.findById(decoded.id)
          .populate('role')
          .select('-password');

        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'User not found'
          });
        }

        if (!req.user.isActive) {
          return res.status(401).json({
            status: 'error',
            message: 'Account has been deactivated'
          });
        }

        next();
      } catch (error) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Check if user has specific role
  static authorize(...roles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Not authenticated'
          });
        }

        // Populate role if not already populated
        if (!req.user.role || typeof req.user.role !== 'object') {
          await req.user.populate('role');
        }

        const userRole = req.user.role?.name?.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());
        const hasRole = allowedRoles.includes(userRole);

        if (!hasRole) {
          return res.status(403).json({
            status: 'error',
            message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${userRole}`
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Check if user has specific permission
  static checkPermission(permissionName) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Not authenticated'
          });
        }

        const hasPermission = await req.user.hasPermission(permissionName);

        if (!hasPermission) {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to perform this action'
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Optional authentication - doesn't require login but attaches user if logged in
  static optional(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id)
          .populate('role')
          .select('-password')
          .then(user => {
            if (user && user.isActive) {
              req.user = user;
            }
            next();
          })
          .catch(() => next());
      } catch (error) {
        next();
      }
    } else {
      next();
    }
  }
}

module.exports = AuthMiddleware;
