import { Router } from 'express';
import { createItem, deleteItem, getItem, listItems, resolveItemAttributes, updateItem } from '../controllers/item.controller';

const router = Router();

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: List items
 *     tags: [Item]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *   post:
 *     summary: Create item
 *     tags: [Item]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreate'
 *           examples:
 *             ex1_minimal:
 *               $ref: '#/components/examples/Item_Create_1_Minimal'
 *             ex2_with_family:
 *               $ref: '#/components/examples/Item_Create_2_WithFamily'
 *             ex3_with_attributes:
 *               $ref: '#/components/examples/Item_Create_3_WithAttributes'
 *             ex4_no_attributes_but_groups:
 *               $ref: '#/components/examples/Item_Create_4_NoAttributesButGroups'
 *             ex5_full:
 *               $ref: '#/components/examples/Item_Create_5_Full'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/', listItems);
router.post('/', createItem);

/**
 * @openapi
 * /api/items/attributes/resolve:
 *   get:
 *     summary: Resolve effective attribute groups for item create
 *     tags: [Item]
 *     parameters:
 *       - in: query
 *         name: itemTypeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: familyId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/attributes/resolve', resolveItemAttributes);

/**
 * @openapi
 * /api/items/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Item]
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
 *     summary: Update item
 *     tags: [Item]
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
 *             $ref: '#/components/schemas/ItemUpdate'
 *           examples:
 *             rename:
 *               value: { name: 'Yeni Item Adı' }
 *             change_family:
 *               value: { familyId: '66e8...f1' }
 *             update_attributes:
 *               value: { attributes: { product_name: 'Güncellenen Ürün', size: 'xl' } }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete item
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id', getItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;

