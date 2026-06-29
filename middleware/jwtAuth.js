const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'oauth-rest-api-demo-secret';

function createToken(user, provider = 'oauth') {
  return jwt.sign({
    provider,
    providerId: user.id,
    username: user.displayName || user.username || `${provider}-user`
  }, jwtSecret, { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : req.body.token || req.query.token || req.get('x-access-token');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function verifyWriteOperation(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return verifyToken(req, res, next);
  }

  return next();
}

module.exports = {
  createToken,
  verifyToken,
  verifyWriteOperation
};
