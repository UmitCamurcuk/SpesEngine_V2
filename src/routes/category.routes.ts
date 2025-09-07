import { Router } from 'express';
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory, getCategoryTree, listFamiliesByCategory } from '../controllers/category.controller';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *   post:
 *     summary: Create category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *           examples:
 *             ex1_minimal:
 *               $ref: '#/components/examples/Category_Create_1_Minimal'
 *             ex2_with_parent:
 *               $ref: '#/components/examples/Category_Create_2_WithParent'
 *             ex3_no_groups:
 *               $ref: '#/components/examples/Category_Create_3_NoGroups'
 *             ex4_empty_groups:
 *               $ref: '#/components/examples/Category_Create_4_EmptyGroups'
 *             ex5_two_groups:
 *               $ref: '#/components/examples/Category_Create_5_TwoGroups'
 *               attributeGroups: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/', authenticate, requirePermission('category.read'), listCategories);
router.post('/', authenticate, requirePermission('category.create'), createCategory);

/**
 * @openapi
 * /api/categories/tree:
 *   get:
 *     summary: Get category tree
 *     tags: [Category]
 *     responses:
 *       200: { description: OK }
 */
router.get('/tree', authenticate, requirePermission('category.read'), getCategoryTree);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by id
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update category
 *     tags: [Category]
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
 *             $ref: '#/components/schemas/CategoryUpdate'
 *           examples:
 *             rename:
 *               value: { name: 'Yeni Kategori Adı' }
 *             reparent:
 *               value: { parent: '66e8...b2' }
 *             groups_update:
 *               value: { attributeGroups: ['66e8...01','66e8...02'] }
 *             attributes_update:
 *               value: { attributes: { keywords: ['trend','2025'] } }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *       409:
 *         description: Removing attributeGroups is restricted while items exist for this category
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       409:
 *         description: Cannot delete category while families/items exist or item types reference it
 *       404: { description: Not Found }
 */
router.get('/:id', authenticate, requirePermission('category.read'), getCategory);
router.patch('/:id', authenticate, requirePermission('category.update'), updateCategory);
router.delete('/:id', authenticate, requirePermission('category.delete'), deleteCategory);

/**
 * @openapi
 * /api/categories/{id}/families:
 *   get:
 *     summary: List families that belong to the category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:id/families', authenticate, requirePermission('family.read'), listFamiliesByCategory);

export default router;
