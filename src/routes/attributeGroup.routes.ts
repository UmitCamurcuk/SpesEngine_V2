import { Router } from 'express';
import { createAttributeGroup, deleteAttributeGroup, getAttributeGroup, listAttributeGroups, updateAttributeGroup } from '../controllers/attributeGroup.controller';

const router = Router();

/**
 * @openapi
 * /api/attribute-groups:
 *   get:
 *     summary: List attribute groups
 *     tags: [AttributeGroup]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create attribute group
 *     tags: [AttributeGroup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttributeGroupCreate'
 *           examples:
 *             default:
 *               $ref: '#/components/examples/AttributeGroup_Create'
 *     responses:
 *       201: { description: Created }
 */
router.get('/', listAttributeGroups);
router.post('/', createAttributeGroup);

/**
 * @openapi
 * /api/attribute-groups/{id}:
 *   get:
 *     summary: Get attribute group by id
 *     tags: [AttributeGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update attribute group
 *     tags: [AttributeGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttributeGroupUpdate'
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete attribute group
 *     tags: [AttributeGroup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getAttributeGroup);
router.patch('/:id', updateAttributeGroup);
router.delete('/:id', deleteAttributeGroup);

export default router;
