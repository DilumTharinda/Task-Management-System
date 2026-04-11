const jwt = require('jsonwebtoken');

// ── AUTH MIDDLEWARE ─────────────────────────────────────
// This function runs BEFORE any protected route handler
// It checks if the incoming request has a valid JWT token

const verifyToken = (req, res, next) => {
  // Step 1: Look for the token in the Authorization header
  // The frontend sends it as: "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      errorCode: 401,
      message: 'Unauthorized',
      description: 'No token provided. Please log in.'
    });
  }

  // Step 2: Extract just the token part (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Step 3: Verify the token using our secret key
    // If tampered or expired, this line throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach the user info to the request object
    // Now any route can access req.user.userId and req.user.role
    req.user = decoded;

    // Step 5: Call next() to move on to the actual route handler
    next();

  } catch (error) {
    return res.status(401).json({
      errorCode: 401,
      message: 'Unauthorized',
      description: 'Token is invalid or has expired. Please log in again.'
    });
  }
};

// ── ROLE MIDDLEWARE ─────────────────────────────────────
// Use this after verifyToken to restrict routes to specific roles
// Example: router.post('/register', verifyToken, requireRole('Admin'), register)

const requireRole = (...roles) => {
  return (req, res, next) => {
    // req.user was set by verifyToken above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        errorCode: 403,
        message: 'Forbidden',
        description: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };