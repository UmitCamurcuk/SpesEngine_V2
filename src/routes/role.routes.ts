import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { createRole, deleteRole, getRole, listRoles, updateRole } from '../controllers/role.controller';

const router = Router();

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: List roles
 *     tags: [Role]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create role
 *     tags: [Role]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', authenticate, requirePermission('role.read'), listRoles);
router.post('/', authenticate, requirePermission('role.create'), createRole);

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by id
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   patch:
 *     summary: Update role
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     summary: Delete role
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', authenticate, requirePermission('role.read'), getRole);
router.patch('/:id', authenticate, requirePermission('role.update'), updateRole);
router.delete('/:id', authenticate, requirePermission('role.delete'), deleteRole);

export default router;

