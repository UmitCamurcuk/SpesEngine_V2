import { Router } from 'express';
import itemTypes from './itemType.routes';
import categories from './category.routes';
import families from './family.routes';
import associations from './association.routes';
import attributes from './attribute.routes';
import attributeGroups from './attributeGroup.routes';

const router = Router();

router.use('/item-types', itemTypes);
router.use('/categories', categories);
router.use('/families', families);
router.use('/associations', associations);
router.use('/attributes', attributes);
router.use('/attribute-groups', attributeGroups);

export default router;
