import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).lean();
  if (!user) return sendError(res, { status: 401, code: 'auth.invalid_credentials', message: 'Invalid credentials' });
  const ok = await comparePassword(password, (user as any).passwordHash);
  if (!ok) return sendError(res, { status: 401, code: 'auth.invalid_credentials', message: 'Invalid credentials' });
  if ((user as any).isActive === false) return sendError(res, { status: 403, code: 'auth.user_inactive', message: 'User inactive' });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // ~30d
  const session = await Session.create({ user: (user as any)._id, userAgent: req.headers['user-agent'] || '', ip: req.ip || '', expiresAt });
  const accessToken = signAccessToken(String((user as any)._id));
  const refreshToken = signRefreshToken(String((user as any)._id), String(session._id));
  return sendSuccess(res, { code: 'auth.login', message: 'OK', data: { accessToken, refreshToken, user } });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) return sendError(res, { status: 400, code: 'auth.refresh.missing', message: 'refreshToken is required' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh' || !payload.sid) throw new Error('invalid token');
    const session = await Session.findById(payload.sid);
    if (!session || session.revokedAt) return sendError(res, { status: 401, code: 'auth.session_invalid', message: 'Invalid session' });
    if (Date.now() > new Date(session.expiresAt).getTime()) return sendError(res, { status: 401, code: 'auth.session_expired', message: 'Session expired' });
    const user = await User.findById(session.user).lean();
    if (!user || (user as any).isActive === false) return sendError(res, { status: 401, code: 'auth.invalid_user', message: 'Invalid user' });
    const accessToken = signAccessToken(String((user as any)._id));
    // Optional: rotate refresh tokens by issuing new one (same session)
    const newRefreshToken = signRefreshToken(String((user as any)._id), String(session._id));
    return sendSuccess(res, { code: 'auth.refresh', message: 'OK', data: { accessToken, refreshToken: newRefreshToken } });
  } catch (e: any) {
    return sendError(res, { status: 401, code: 'auth.refresh.invalid', message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) return sendError(res, { status: 400, code: 'auth.logout.missing', message: 'refreshToken is required' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload.sid) throw new Error('invalid');
    await Session.findByIdAndUpdate(payload.sid, { revokedAt: new Date() });
    return sendSuccess(res, { code: 'auth.logout', message: 'OK', data: { revoked: true } });
  } catch (e) {
    return sendError(res, { status: 400, code: 'auth.logout.invalid', message: 'Invalid refresh token' });
  }
};

// Simple admin bootstrap endpoint (optional; remove in production)
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, roleId } = req.body as { name: string; email: string; password: string; roleId: string };
  const passwordHash = await hashPassword(password);
  const doc = await (await import('../models/User')).User.create({ name, email, passwordHash, role: roleId });
  return sendSuccess(res, { code: 'user.created', message: 'OK', data: doc });
};
