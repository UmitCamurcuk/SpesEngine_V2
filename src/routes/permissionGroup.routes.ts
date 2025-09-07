import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { createPermissionGroup, deletePermissionGroup, getPermissionGroup, listPermissionGroups, updatePermissionGroup } from '../controllers/permissionGroup.controller';

const router = Router();

/**
 * @openapi
 * /api/permission-groups:
 *   get:
 *     summary: List permission groups
 *     tags: [PermissionGroup]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create permission group
 *     tags: [PermissionGroup]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', authenticate, requirePermission('permissionGroup.read'), listPermissionGroups);
router.post('/', authenticate, requirePermission('permissionGroup.create'), createPermissionGroup);

/**
 * @openapi
 * /api/permission-groups/{id}:
 *   get:
 *     summary: Get permission group by id
 *     tags: [PermissionGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   patch:
 *     summary: Update permission group
 *     tags: [PermissionGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   delete:
 *     summary: Delete permission group
 *     tags: [PermissionGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id', authenticate, requirePermission('permissionGroup.read'), getPermissionGroup);
router.patch('/:id', authenticate, requirePermission('permissionGroup.update'), updatePermissionGroup);
router.delete('/:id', authenticate, requirePermission('permissionGroup.delete'), deletePermissionGroup);

export default router;

