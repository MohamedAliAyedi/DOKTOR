const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/appError');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new AppError('User not found. Token invalid.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated.', 401));
    }

    if (user.isLocked) {
      return next(new AppError('Account is temporarily locked due to multiple failed login attempts.', 423));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    return next(new AppError('Token verification failed.', 401));
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }

    next();
  };
};

// Check if user owns resource or has permission
const checkOwnership = (resourceField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const model = req.baseUrl.split('/').pop(); // Get model name from route
      
      // This is a simplified ownership check
      // In a real application, you'd implement more sophisticated permission checking
      if (req.user.role === 'admin') {
        return next(); // Admins can access everything
      }

      // For doctors, check if they have access to the patient/resource
      if (req.user.role === 'doctor') {
        // Implement doctor-specific permission logic
        return next();
      }

      // For patients, check if they own the resource
      if (req.user.role === 'patient') {
        // Implement patient-specific permission logic
        return next();
      }

      // For secretaries, check their permissions
      if (req.user.role === 'secretary') {
        // Implement secretary-specific permission logic
        return next();
      }

      return next(new AppError('Access denied. Insufficient permissions.', 403));
    } catch (error) {
      return next(new AppError('Permission check failed.', 500));
    }
  };
};

// Verify email middleware
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError('Email verification required.', 403));
  }
  next();
};

// Verify phone middleware
const requirePhoneVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return next(new AppError('Phone verification required.', 403));
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  requireEmailVerification,
  requirePhoneVerification,
  optionalAuth
};