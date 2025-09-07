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
 *         schema: { $ref: '#/components/schemas/EntityModel' }
 *       - in: query
 *         name: fromId
 *         schema: { type: string }
 *       - in: query
 *         name: toModel
 *         schema: { $ref: '#/components/schemas/EntityModel' }
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
 *             $ref: '#/components/schemas/AssociationCreate'
 *           examples:
 *             ex1_cat_to_itemtype:
 *               $ref: '#/components/examples/Association_Create_1_CategoryToItemType'
 *             ex2_family_to_category:
 *               $ref: '#/components/examples/Association_Create_2_FamilyToCategory'
 *             ex3_itemtype_to_category:
 *               $ref: '#/components/examples/Association_Create_3_ItemTypeToCategory'
 *             ex4_family_to_itemtype:
 *               $ref: '#/components/examples/Association_Create_4_FamilyToItemType'
 *             ex5_category_contains_family:
 *               $ref: '#/components/examples/Association_Create_5_CategoryContainsFamily'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
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
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id', getAssociation);
router.delete('/:id', deleteAssociation);

export default router;
