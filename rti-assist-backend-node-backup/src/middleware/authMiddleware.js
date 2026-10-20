import { config } from '../config.js';

export function parseJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payloadBase64 = parts[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      return JSON.parse(decodedJson);
    }
  } catch (err) {
    // ignore
  }
  return null;
}

export function generateJwtToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'citizen',
      iss: 'rti-assist-backend',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })
  ).toString('base64');
  const signature = Buffer.from(config.jwtSecret).toString('base64');
  return `${header}.${payload}.${signature}`;
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Authentication token is required',
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = parseJwtPayload(token);

  if (!payload) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired authorization token',
    });
  }

  req.user = {
    id: payload.sub || 'usr-101',
    email: payload.email,
    name: payload.name,
    role: payload.role || 'citizen',
  };

  next();
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = parseJwtPayload(token);
    if (payload) {
      req.user = {
        id: payload.sub || 'usr-101',
        email: payload.email,
        name: payload.name,
        role: payload.role || 'citizen',
      };
    }
  }
  next();
}
