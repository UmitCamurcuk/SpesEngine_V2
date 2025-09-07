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
 *             default:
 *               $ref: '#/components/examples/Family_Create'
 *               attributeGroups: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *     responses:
 *       201: { description: Created }
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
 *     responses:
 *       200: { description: OK }
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
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getFamily);
router.patch('/:id', updateFamily);
router.delete('/:id', deleteFamily);

export default router;
