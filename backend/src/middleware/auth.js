const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    req.admin = payload; // backwards compatibility
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}

// 1. Only Admin can access
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Forbidden: Admin access required',
        role: req.user.role 
      });
    }
    next();
  });
}

// 2. Briefs / Start Project: Allowed for Admin, Manager (read-only), Sales. Data Entry is blocked!
function requireBriefsAccess(req, res, next) {
  authenticateToken(req, res, () => {
    const allowed = ['admin', 'manager', 'sales'];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access Denied: Data Entry role does not have access to Start Project briefs.',
        role: req.user.role
      });
    }
    next();
  });
}

// 3. Content Pages (Videos, Outdoor, POSS, Clients, Blog): Allowed for Admin, Manager (read-only), Data Entry. Sales is blocked!
function requireContentAccess(req, res, next) {
  authenticateToken(req, res, () => {
    const allowed = ['admin', 'manager', 'data_entry'];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access Denied: Sales role only has access to Start Project.',
        role: req.user.role
      });
    }
    next();
  });
}

// 4. Mutation checks: Manager is strictly Read-Only across all pages!
function requireWriteAccess(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role === 'manager') {
      return res.status(403).json({ 
        message: 'Access Denied: Manager role is Read-Only. Creating, modifying, or deleting items is disabled.',
        role: req.user.role
      });
    }
    next();
  });
}

module.exports = { 
  authenticateToken, 
  requireAdmin, 
  requireBriefsAccess, 
  requireContentAccess, 
  requireWriteAccess 
};
