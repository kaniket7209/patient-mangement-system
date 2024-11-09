const jwt = require('jsonwebtoken');

// Middleware to verify token and attach user to request
const authenticate = (req, res, next) => {
  // Check if token is provided in the Authorization header
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // Verify the token and decode the user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Make sure you have the correct secret key
    req.user = decoded.user;  // Add the decoded user object to the request
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};


// Middleware to check user role (admin, doctor)
const checkRole = (roles) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = { authenticate, checkRole };
