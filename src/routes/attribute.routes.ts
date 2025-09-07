import { Router } from 'express';
import { createAttribute, deleteAttribute, getAttribute, listAttributes, updateAttribute } from '../controllers/attribute.controller';

const router = Router();

/**
 * @openapi
 * /api/attributes:
 *   get:
 *     summary: List attributes
 *     tags: [Attribute]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create attribute
 *     tags: [Attribute]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttributeCreate'
 *           examples:
 *             text:
 *               $ref: '#/components/examples/Attribute_Text'
 *             number:
 *               $ref: '#/components/examples/Attribute_Number'
 *             select:
 *               $ref: '#/components/examples/Attribute_Select'
 *             multiselect:
 *               $ref: '#/components/examples/Attribute_MultiSelect'
 *             file:
 *               $ref: '#/components/examples/Attribute_File'
 *             image:
 *               $ref: '#/components/examples/Attribute_Image'
 *             attachment:
 *               $ref: '#/components/examples/Attribute_Attachment'
 *             object:
 *               $ref: '#/components/examples/Attribute_Object'
 *             array:
 *               $ref: '#/components/examples/Attribute_Array'
 *             json:
 *               $ref: '#/components/examples/Attribute_JSON'
 *             formula:
 *               $ref: '#/components/examples/Attribute_Formula'
 *             expression:
 *               $ref: '#/components/examples/Attribute_Expression'
 *             table:
 *               $ref: '#/components/examples/Attribute_Table'
 *             color:
 *               $ref: '#/components/examples/Attribute_Color'
 *             rich_text:
 *               $ref: '#/components/examples/Attribute_RichText'
 *             rating:
 *               $ref: '#/components/examples/Attribute_Rating'
 *             barcode:
 *               $ref: '#/components/examples/Attribute_Barcode'
 *             qr:
 *               $ref: '#/components/examples/Attribute_QR'
 *             readonly:
 *               $ref: '#/components/examples/Attribute_Readonly'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 */
router.get('/', listAttributes);
router.post('/', createAttribute);

/**
 * @openapi
 * /api/attributes/{id}:
 *   get:
 *     summary: Get attribute by id
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 *   patch:
 *     summary: Update attribute
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *           examples:
 *             rename:
 *               value: { name: 'Yeni Attribute Adı' }
 *             change_config_text:
 *               value: { config: { minLength: 2, maxLength: 255 } }
 *             deactivate:
 *               value: { active: false }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiResponse' }
 *       404: { description: Not Found }
 *   delete:
 *     summary: Delete attribute
 *     tags: [Attribute]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not Found }
 */
router.get('/:id', getAttribute);
router.patch('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

export default router;
