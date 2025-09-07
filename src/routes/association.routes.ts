import { Router } from 'express';
import { createAssociation, deleteAssociation, getAssociation, listAssociations } from '../controllers/association.controller';

const router = Router();

/**
 * @openapi
 * /api/associations:
 *   get:
 *     summary: List associations (filterable)
 *     tags: [Association]
 *     parameters:
 *       - in: query
 *         name: fromModel
 *         schema: { type: string, enum: [ItemType, Category, Family] }
 *       - in: query
 *         name: fromId
 *         schema: { type: string }
 *       - in: query
 *         name: toModel
 *         schema: { type: string, enum: [ItemType, Category, Family] }
 *       - in: query
 *         name: toId
 *         schema: { type: string }
 *       - in: query
 *         name: kind
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create association between entities
 *     tags: [Association]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromModel, fromId, toModel, toId]
 *             properties:
 *               fromModel: { type: string, enum: [ItemType, Category, Family] }
 *               fromId: { type: string }
 *               toModel: { type: string, enum: [ItemType, Category, Family] }
 *               toId: { type: string }
 *               kind: { type: string }
 *               metadata: { type: object }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', listAssociations);
router.post('/', createAssociation);

/**
 * @openapi
 * /api/associations/{id}:
 *   get:
 *     summary: Get association by id
 *     tags: [Association]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete association
 *     tags: [Association]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getAssociation);
router.delete('/:id', deleteAssociation);

export default router;

