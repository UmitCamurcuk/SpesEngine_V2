import { Router } from 'express';
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory, getCategoryTree } from '../controllers/category.controller';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Category]
 *     responses:
 *       200: { description: OK }
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
 *             default:
 *               $ref: '#/components/examples/Category_Create'
 *               attributeGroups: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', listCategories);
router.post('/', createCategory);

/**
 * @openapi
 * /api/categories/tree:
 *   get:
 *     summary: Get category tree
 *     tags: [Category]
 *     responses:
 *       200: { description: OK }
 */
router.get('/tree', getCategoryTree);

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
 *     responses:
 *       200: { description: OK }
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
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
