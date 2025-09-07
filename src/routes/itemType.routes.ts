import { Router } from 'express';
import { createItemType, listItemTypes, getItemType, updateItemType, deleteItemType } from '../controllers/itemType.controller';

const router = Router();

/**
 * @openapi
 * /api/item-types:
 *   get:
 *     summary: List item types
 *     tags: [ItemType]
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create item type
 *     tags: [ItemType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemTypeCreate'
 *           examples:
 *             ex1_minimal:
 *               $ref: '#/components/examples/ItemType_Create_1_Minimal'
 *             ex2_with_desc:
 *               $ref: '#/components/examples/ItemType_Create_2_WithDesc'
 *             ex3_with_groups:
 *               $ref: '#/components/examples/ItemType_Create_3_WithGroups'
 *             ex4_groups_and_attrs:
 *               $ref: '#/components/examples/ItemType_Create_4_WithGroupsAndAttrs'
 *             ex5_empty_groups:
 *               $ref: '#/components/examples/ItemType_Create_5_EmptyGroups'
 *               attributeGroups: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', listItemTypes);
router.post('/', createItemType);

/**
 * @openapi
 * /api/item-types/{id}:
 *   get:
 *     summary: Get item type by id
 *     tags: [ItemType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update item type
 *     tags: [ItemType]
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
 *             $ref: '#/components/schemas/ItemTypeUpdate'
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete item type
 *     tags: [ItemType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getItemType);
router.patch('/:id', updateItemType);
router.delete('/:id', deleteItemType);

export default router;
