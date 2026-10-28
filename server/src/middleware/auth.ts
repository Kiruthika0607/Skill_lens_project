import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sih-industry-skill-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin' | 'industry';
    studentId?: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: ('student' | 'admin' | 'industry')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}
