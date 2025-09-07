import { Router } from 'express';
import itemTypes from './itemType.routes';
import categories from './category.routes';
import families from './family.routes';
import associations from './association.routes';
import attributes from './attribute.routes';
import attributeGroups from './attributeGroup.routes';
import items from './item.routes';
import auth from './auth.routes';
import roles from './role.routes';
import permissionGroups from './permissionGroup.routes';

const router = Router();

router.use('/item-types', itemTypes);
router.use('/categories', categories);
router.use('/families', families);
router.use('/associations', associations);
router.use('/attributes', attributes);
router.use('/attribute-groups', attributeGroups);
router.use('/items', items);
router.use('/auth', auth);
router.use('/roles', roles);
router.use('/permission-groups', permissionGroups);

export default router;
