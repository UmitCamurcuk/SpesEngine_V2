import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loadEnv } from '../config/env';
import { User } from '../models/User';
import { Role } from '../models/Role';

const env = loadEnv();

export type JwtPayload = { sub: string; type: 'access' | 'refresh'; sid?: string };

export const signAccessToken = (userId: string) => {
  const payload: JwtPayload = { sub: userId, type: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
};

export const signRefreshToken = (userId: string, sessionId: string) => {
  const payload: JwtPayload = { sub: userId, type: 'refresh', sid: sessionId };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    if (!token) return res.status(401).json({ success: false, status: 401, code: 'auth.missing_token', message: 'Missing token' });
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user || user.isActive === false) return res.status(401).json({ success: false, status: 401, code: 'auth.invalid_user', message: 'Invalid user' });
    (req as any).auth = { userId: String(user._id), roleId: String(user.role) };
    next();
  } catch (e: any) {
    return res.status(401).json({ success: false, status: 401, code: 'auth.invalid_token', message: 'Invalid token' });
  }
};

export const requirePermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth as { userId: string; roleId: string } | undefined;
      if (!auth) return res.status(401).json({ success: false, status: 401, code: 'auth.required', message: 'Authentication required' });
      const role = await Role.findById(auth.roleId).lean();
      if (!role || role.active === false) return res.status(403).json({ success: false, status: 403, code: 'auth.role_inactive', message: 'Role inactive' });
      if ((role as any).isAdmin === true) return next();
      const grants = (role as any).grants || {};
      const allowed = grants.get ? grants.get(permissionCode) : grants[permissionCode];
      if (allowed === true) return next();
      return res.status(403).json({ success: false, status: 403, code: 'auth.forbidden', message: 'Permission denied' });
    } catch (e) {
      return res.status(500).json({ success: false, status: 500, code: 'auth.error', message: 'Authorization error' });
    }
  };
};

