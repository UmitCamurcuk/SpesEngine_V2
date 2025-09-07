import { Router } from 'express';
import { createItemType, listItemTypes, getItemType, updateItemType, deleteItemType, listCategoriesByItemType } from '../controllers/itemType.controller';
import { authenticate, requirePermission } from '../middleware/auth';

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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/', authenticate, requirePermission('itemType.read'), listItemTypes);
router.post('/', authenticate, requirePermission('itemType.create'), createItemType);

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
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
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
 *           examples:
 *             update_name:
 *               value: { name: 'Yeni Ürün Adı' }
 *             update_groups:
 *               value: { attributeGroups: ['66e8...a1'] }
 *             update_attributes:
 *               value: { attributes: { product_name: 'Güncel Ürün', size: 'l' } }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *       409:
 *         description: Removing attributeGroups is restricted while items exist for this item type
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
 *       200: { description: OK }
 *       409:
 *         description: Cannot delete ItemType while items exist
 *       404: { description: Not Found }
 */
router.get('/:id', authenticate, requirePermission('itemType.read'), getItemType);
router.patch('/:id', authenticate, requirePermission('itemType.update'), updateItemType);
router.delete('/:id', authenticate, requirePermission('itemType.delete'), deleteItemType);

/**
 * @openapi
 * /api/item-types/{id}/categories:
 *   get:
 *     summary: List categories that belong to the item type
 *     tags: [ItemType]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id/categories', authenticate, requirePermission('category.read'), listCategoriesByItemType);

export default router;
