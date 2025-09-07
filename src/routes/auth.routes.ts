import { Router } from 'express';
import { createUser, login, logout, refresh } from '../controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [email, password], properties: { email: { type: string }, password: { type: string } } }
 *     responses:
 *       200: { description: OK }
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [refreshToken], properties: { refreshToken: { type: string } } }
 *     responses:
 *       200: { description: OK }
 */
router.post('/refresh', refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout (revoke session)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [refreshToken], properties: { refreshToken: { type: string } } }
 *     responses:
 *       200: { description: OK }
 */
router.post('/logout', logout);

// bootstrap helper (protect/remove in prod)
/**
 * @openapi
 * /api/auth/users:
 *   post:
 *     summary: Create user (bootstrap)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [name,email,password,roleId], properties: { name: { type: string }, email: { type: string }, password: { type: string }, roleId: { type: string } } }
 *     responses:
 *       200: { description: OK }
 */
router.post('/users', createUser);

export default router;

