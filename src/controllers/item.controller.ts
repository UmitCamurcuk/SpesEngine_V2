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

const loadGroupsFor = async (opts: { itemTypeId: string; categoryId?: string | null; familyId?: string | null }) => {
  const it = await ItemType.findById(opts.itemTypeId).lean();
  if (!it) throw Object.assign(new Error('ItemType not found'), { status: 404, code: 'itemtype.not_found' });
  const categoryId = (opts.categoryId as any) || (it as any).category;
  if (!categoryId) throw Object.assign(new Error('Category not resolved from itemType'), { status: 400, code: 'item.category_missing' });
  const cat = await Category.findById(categoryId).lean();
  if (!cat) throw Object.assign(new Error('Category not found'), { status: 404, code: 'category.not_found' });
  let fam: any = null;
  if (opts.familyId) {
    fam = await Family.findById(opts.familyId).lean();
    if (!fam) throw Object.assign(new Error('Family not found'), { status: 404, code: 'family.not_found' });
  }
  const groupIds: string[] = [
    ...(((it as any).attributeGroups as string[]) || []),
    ...(((cat as any).attributeGroups as string[]) || []),
    ...((fam ? (fam.attributeGroups as string[]) : []) || []),
  ].map((id: any) => String(id));
  return { itemType: it, category: cat, family: fam, groupIds };
};

export const resolveItemAttributes = async (req: Request, res: Response) => {
  const { itemTypeId, categoryId, familyId } = req.query as any;
  if (!itemTypeId) return sendError(res, { status: 400, code: 'item.resolve.missing_itemtype', message: 'itemTypeId is required' });
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
    name: string; code: string; itemTypeId: string; categoryId?: string | null; familyId?: string | null; attributes?: Record<string, any>;
  };

  if (!itemTypeId) return sendError(res, { status: 400, code: 'item.itemtype_required', message: 'itemTypeId is required' });

  const it = await ensureExists<any>(ItemType, itemTypeId, 'ItemType', 'itemtype.not_found');
  const resolvedCategoryId = categoryId || String(it.category);
  if (!resolvedCategoryId) return sendError(res, { status: 400, code: 'item.category_missing', message: 'Category cannot be resolved from itemType; provide categoryId' });
  const cat = await ensureExists<any>(Category, resolvedCategoryId, 'Category', 'category.not_found');
  let fam: any = null;
  if (familyId) fam = await ensureExists<any>(Family, familyId, 'Family', 'family.not_found');

  // Validate attributes against union of groups
  const groupIds: string[] = [
    ...((it.attributeGroups as any[]) || []),
    ...((cat.attributeGroups as any[]) || []),
    ...((fam ? (fam.attributeGroups as any[]) : [])),
  ].map((id: any) => String(id));
  const normalized = await validateEntityAttributes({ attributeGroupIds: groupIds, values: attributes, isUpdate: false });

  const doc = await Item.create({ name, code, itemType: itemTypeId, category: resolvedCategoryId, family: familyId || null, attributes: normalized });
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
  const it = await ensureExists<any>(ItemType, nextItemTypeId, 'ItemType', 'itemtype.not_found');
  const nextCategoryId = (req.body.categoryId as string) || String(existing.category) || String(it.category);
  const cat = await ensureExists<any>(Category, nextCategoryId, 'Category', 'category.not_found');
  const nextFamilyId = (req.body.familyId as string) || (existing.family ? String(existing.family) : undefined);
  let fam: any = null;
  if (nextFamilyId) fam = await ensureExists<any>(Family, nextFamilyId, 'Family', 'family.not_found');

  let normalizedAttributes = existing.attributes as any;
  if (req.body.attributes) {
    const groupIds: string[] = [
      ...((it.attributeGroups as any[]) || []),
      ...((cat.attributeGroups as any[]) || []),
      ...((fam ? (fam.attributeGroups as any[]) : [])),
    ].map((id: any) => String(id));
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

