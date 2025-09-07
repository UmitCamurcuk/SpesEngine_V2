import { Router } from 'express';
import { createAttribute, deleteAttribute, getAttribute, listAttributes, updateAttribute } from '../controllers/attribute.controller';

const router = Router();

/**
 * @openapi
 * /api/attributes:
 *   get:
 *     summary: List attributes
 *     tags: [Attribute]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create attribute
 *     tags: [Attribute]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, type]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               required: { type: boolean }
 *               defaultValue: { }
 *               config: { type: object }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', listAttributes);
router.post('/', createAttribute);

/**
 * @openapi
 * /api/attributes/{id}:
 *   get:
 *     summary: Get attribute by id
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update attribute
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete attribute
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getAttribute);
router.patch('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

export default router;

