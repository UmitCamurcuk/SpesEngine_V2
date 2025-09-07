import { Router } from 'express';
import { createFamily, deleteFamily, getFamily, listFamilies, updateFamily, getFamilyTree } from '../controllers/family.controller';

const router = Router();

/**
 * @openapi
 * /api/families:
 *   get:
 *     summary: List families
 *     tags: [Family]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create family
 *     tags: [Family]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamilyCreate'
 *           examples:
 *             ex1_minimal:
 *               $ref: '#/components/examples/Family_Create_1_Minimal'
 *             ex2_with_parent:
 *               $ref: '#/components/examples/Family_Create_2_WithParent'
 *             ex3_no_groups:
 *               $ref: '#/components/examples/Family_Create_3_NoGroups'
 *             ex4_empty_groups:
 *               $ref: '#/components/examples/Family_Create_4_EmptyGroups'
 *             ex5_two_groups:
 *               $ref: '#/components/examples/Family_Create_5_TwoGroups'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/', listFamilies);
router.post('/', createFamily);

/**
 * @openapi
 * /api/families/tree:
 *   get:
 *     summary: Get family tree
 *     tags: [Family]
 *     responses:
 *       200: { description: OK }
 */
router.get('/tree', getFamilyTree);

/**
 * @openapi
 * /api/families/{id}:
 *   get:
 *     summary: Get family by id
 *     tags: [Family]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update family
 *     tags: [Family]
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
 *             $ref: '#/components/schemas/FamilyUpdate'
 *           examples:
 *             rename:
 *               value: { name: 'Yeni Family Adı' }
 *             reparent:
 *               value: { parent: '66e8...f1' }
 *             groups_update:
 *               value: { attributeGroups: ['66e8...g1','66e8...g2'] }
 *             attributes_update:
 *               value: { attributes: { size_table: [{ size:'m', chest: 52, waist: 50 }] } }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete family
 *     tags: [Family]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id', getFamily);
router.patch('/:id', updateFamily);
router.delete('/:id', deleteFamily);

export default router;
