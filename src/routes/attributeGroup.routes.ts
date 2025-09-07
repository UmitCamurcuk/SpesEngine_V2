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
 *             ex1_minimal:
 *               $ref: '#/components/examples/AttributeGroup_Create_1_Minimal'
 *             ex2_with_desc:
 *               $ref: '#/components/examples/AttributeGroup_Create_2_WithDesc'
 *             ex3_with_attributes:
 *               $ref: '#/components/examples/AttributeGroup_Create_3_WithAttributes'
 *             ex4_empty_attributes:
 *               $ref: '#/components/examples/AttributeGroup_Create_4_EmptyAttributes'
 *             ex5_another:
 *               $ref: '#/components/examples/AttributeGroup_Create_5_Another'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
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
 *           examples:
 *             rename:
 *               value: { name: 'Yeni Grup Adı' }
 *             change_attributes:
 *               value: { attributes: ['66e8...a1','66e8...a2'] }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
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
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id', getAttributeGroup);
router.patch('/:id', updateAttributeGroup);
router.delete('/:id', deleteAttributeGroup);

export default router;
