import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { ItemType } from '../models/ItemType';
import { Category } from '../models/Category';
import { Family } from '../models/Family';
import { sendCreated, sendError, sendSuccess } from '../utils/response';
import { validateEntityAttributes } from '../utils/attributeValidation';

const ensureExists = async <T>(model: any, id: string, code: string, notFoundCode: string) => {
  const doc = await model.findById(id);
  if (!doc) throw Object.assign(new Error(`${code} not found`), { status: 404, code: notFoundCode });
  return doc as T;
};

const loadGroupsFor = async (opts: { itemTypeId: string; categoryId: string; familyId?: string | null }) => {
  const it = await ItemType.findById(opts.itemTypeId).lean();
  if (!it) throw Object.assign(new Error('ItemType not found'), { status: 404, code: 'itemtype.not_found' });

  const cat = await Category.findById(opts.categoryId).lean();
  if (!cat) throw Object.assign(new Error('Category not found'), { status: 404, code: 'category.not_found' });

  // Ensure category belongs to the chosen itemType via Category.itemType
  if (!cat.itemType || String(cat.itemType) !== String(opts.itemTypeId)) {
    throw Object.assign(new Error('Category does not belong to selected itemType'), { status: 400, code: 'item.category_not_allowed' });
  }

  let fam: any = null;
  if (opts.familyId) {
    fam = await Family.findById(opts.familyId).lean();
    if (!fam) throw Object.assign(new Error('Family not found'), { status: 404, code: 'family.not_found' });
    if (!fam.category || String(fam.category) !== String(cat._id)) {
      throw Object.assign(new Error('Family does not belong to selected category'), { status: 400, code: 'item.family_category_mismatch' });
    }
  }

  // Collect attribute groups including ancestors for category and family
  const categoryIds = [String(cat._id), ...(((cat as any).ancestors || []).map((a: any) => String(a)))];
  const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
  const categoryGroupIds = categories.flatMap((c: any) => ((c.attributeGroups as any[]) || []).map((x) => String(x)));

  let familyGroupIds: string[] = [];
  if (fam) {
    const familyIds = [String(fam._id), ...(((fam as any).ancestors || []).map((a: any) => String(a)))];
    const families = await Family.find({ _id: { $in: familyIds } }).lean();
    familyGroupIds = families.flatMap((f: any) => ((f.attributeGroups as any[]) || []).map((x) => String(x)));
  }

  const groupIds: string[] = [
    ...(((it as any).attributeGroups as string[]) || []).map((x: any) => String(x)),
    ...categoryGroupIds,
    ...familyGroupIds,
  ];
  // ensure unique
  const uniqueGroupIds = Array.from(new Set(groupIds));
  return { itemType: it, category: cat, family: fam, groupIds: uniqueGroupIds };
};

export const resolveItemAttributes = async (req: Request, res: Response) => {
  const { itemTypeId, categoryId, familyId } = req.query as any;
  if (!itemTypeId) return sendError(res, { status: 400, code: 'item.resolve.missing_itemtype', message: 'itemTypeId is required' });
  if (!categoryId) return sendError(res, { status: 400, code: 'item.resolve.missing_category', message: 'categoryId is required' });
  try {
    const { itemType, category, family, groupIds } = await loadGroupsFor({ itemTypeId, categoryId, familyId });
    // We only return schema (attributes) definitions. Utils loader already returns docs; we’ll refetch via validation util to keep single source
    // But to avoid extra fetch, send groupIds to client; or we can just return attributes via populate util later.
    // For simplicity, return combined info and groupIds; client can preview.
    return sendSuccess(res, {
      code: 'item.resolve_attributes',
      message: 'Resolved attribute groups for item creation',
      data: {
        itemType,
        category,
        family,
        attributeGroupIds: groupIds,
      },
    });
  } catch (e: any) {
    return sendError(res, { status: e.status || 500, code: e.code || 'item.resolve.error', message: e.message || 'Failed to resolve attributes' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  const { name, code, itemTypeId, categoryId, familyId, attributes } = req.body as {
    name: string; code: string; itemTypeId: string; categoryId: string; familyId?: string | null; attributes?: Record<string, any>;
  };

  if (!itemTypeId) return sendError(res, { status: 400, code: 'item.itemtype_required', message: 'itemTypeId is required' });
  if (!categoryId) return sendError(res, { status: 400, code: 'item.category_required', message: 'categoryId is required' });

  const it = await ensureExists<any>(ItemType, itemTypeId, 'ItemType', 'itemtype.not_found');
  const cat = await ensureExists<any>(Category, categoryId, 'Category', 'category.not_found');
  if (!cat.itemType || String(cat.itemType) !== String(it._id)) {
    return sendError(res, { status: 400, code: 'item.category_not_allowed', message: 'Selected category does not belong to the chosen itemType' });
  }
  let fam: any = null;
  if (familyId) {
    fam = await ensureExists<any>(Family, familyId, 'Family', 'family.not_found');
    if (!fam.category || String(fam.category) !== String(categoryId)) {
      return sendError(res, { status: 400, code: 'item.family_category_mismatch', message: 'Family must belong to the selected category' });
    }
  }

  const { groupIds } = await loadGroupsFor({ itemTypeId, categoryId, familyId });
  const normalized = await validateEntityAttributes({ attributeGroupIds: groupIds, values: attributes, isUpdate: false });

  const doc = await Item.create({ name, code, itemType: itemTypeId, category: categoryId, family: familyId || null, attributes: normalized });
  const populated = await Item.findById(doc._id).populate('itemType').populate('category').populate('family');
  return sendCreated(res, { code: 'item.created', message: 'Item created', data: populated });
};

export const listItems = async (_req: Request, res: Response) => {
  const items = await Item.find().populate('itemType').populate('category').populate('family').sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'item.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getItem = async (req: Request, res: Response) => {
  const doc = await Item.findById(req.params.id).populate('itemType').populate('category').populate('family');
  if (!doc) return sendError(res, { status: 404, code: 'item.not_found', message: 'Item not found' });
  return sendSuccess(res, { code: 'item.get', message: 'OK', data: doc });
};

export const updateItem = async (req: Request, res: Response) => {
  const existing = await Item.findById(req.params.id);
  if (!existing) return sendError(res, { status: 404, code: 'item.not_found', message: 'Item not found' });

  const nextItemTypeId = (req.body.itemTypeId as string) || String(existing.itemType);
  const nextCategoryId = (req.body.categoryId as string) || String(existing.category);
  const it = await ensureExists<any>(ItemType, nextItemTypeId, 'ItemType', 'itemtype.not_found');
  const cat = await ensureExists<any>(Category, nextCategoryId, 'Category', 'category.not_found');
  if (!cat.itemType || String(cat.itemType) !== String(it._id)) {
    return sendError(res, { status: 400, code: 'item.category_not_allowed', message: 'Selected category does not belong to the chosen itemType' });
  }
  const nextFamilyId = (req.body.familyId as string) || (existing.family ? String(existing.family) : undefined);
  let fam: any = null;
  if (nextFamilyId) {
    fam = await ensureExists<any>(Family, nextFamilyId, 'Family', 'family.not_found');
    if (!fam.category || String(fam.category) !== String(nextCategoryId)) {
      return sendError(res, { status: 400, code: 'item.family_category_mismatch', message: 'Family must belong to the selected category' });
    }
  }

  let normalizedAttributes = existing.attributes as any;
  if (req.body.attributes) {
    const { groupIds } = await loadGroupsFor({ itemTypeId: String(it._id), categoryId: String(cat._id), familyId: fam ? String(fam._id) : undefined });
    normalizedAttributes = await validateEntityAttributes({
      attributeGroupIds: groupIds,
      values: req.body.attributes,
      existingValues: existing.attributes as any,
      isUpdate: true,
    });
  }

  const patch: any = { ...req.body };
  if (req.body.itemTypeId) patch.itemType = req.body.itemTypeId;
  if (req.body.categoryId) patch.category = req.body.categoryId;
  if (req.body.familyId !== undefined) patch.family = req.body.familyId;
  if (req.body.attributes) patch.attributes = normalizedAttributes;

  const updated = await Item.findByIdAndUpdate(req.params.id, patch, { new: true })
    .populate('itemType').populate('category').populate('family');
  return sendSuccess(res, { code: 'item.updated', message: 'Item updated', data: updated });
};

export const deleteItem = async (req: Request, res: Response) => {
  const doc = await Item.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'item.not_found', message: 'Item not found' });
  return sendSuccess(res, { code: 'item.deleted', message: 'Item deleted', data: { id: doc._id } });
};
