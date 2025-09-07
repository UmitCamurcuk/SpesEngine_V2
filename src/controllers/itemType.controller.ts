import { Request, Response } from 'express';
import { ItemType } from '../models/ItemType';
import { Item } from '../models/Item';
import { Category } from '../models/Category';
import { Association } from '../models/Association';
import { validateEntityAttributes } from '../utils/attributeValidation';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createItemType = async (req: Request, res: Response) => {
  const { categoryId } = req.body as { categoryId?: string };
  if (!categoryId || typeof categoryId !== 'string') {
    return sendError(res, { status: 400, code: 'itemtype.category_required', message: 'categoryId is required and must be a string' });
  }
  const category = await Category.findById(categoryId).lean();
  if (!category) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });

  if (req.body.attributes || req.body.attributeGroups) {
    const groupIds: string[] = req.body.attributeGroups || [];
    const normalized = await validateEntityAttributes({ attributeGroupIds: groupIds, values: req.body.attributes, isUpdate: false });
    req.body.attributes = normalized;
  }
  // Remove linkage helper field from payload to avoid persisting unknown field
  delete (req.body as any).categoryId;

  // Persist primary link directly on document for easy reads
  (req.body as any).category = categoryId;
  const doc = await ItemType.create(req.body);
  await Association.create({ fromModel: 'ItemType', fromId: doc._id, toModel: 'Category', toId: categoryId, kind: 'belongs_to' });
  return sendCreated(res, { code: 'itemtype.created', message: 'ItemType created', data: doc });
};

export const listItemTypes = async (_req: Request, res: Response) => {
  const items = await ItemType.find().populate('category').sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'itemtype.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getItemType = async (req: Request, res: Response) => {
  const doc = await ItemType.findById(req.params.id).populate('category');
  if (!doc) return sendError(res, { status: 404, code: 'itemtype.not_found', message: 'ItemType not found' });
  return sendSuccess(res, { code: 'itemtype.get', message: 'OK', data: doc });
};

export const updateItemType = async (req: Request, res: Response) => {
  const existing = await ItemType.findById(req.params.id);
  if (!existing) return sendError(res, { status: 404, code: 'itemtype.not_found', message: 'ItemType not found' });
  // If attributeGroups is provided, ensure we are not removing groups while items exist for this itemType
  if (Array.isArray(req.body.attributeGroups)) {
    const prev: string[] = ((existing.get('attributeGroups') as any) || []).map((x: any) => String(x));
    const next: string[] = (req.body.attributeGroups || []).map((x: any) => String(x));
    const removed = prev.filter((p) => !next.includes(p));
    if (removed.length > 0) {
      const itemCount = await Item.countDocuments({ itemType: existing._id });
      if (itemCount > 0) {
        return sendError(res, { status: 409, code: 'itemtype.groups_remove_restricted', message: 'Cannot remove attribute groups while items exist for this item type' });
      }
    }
  }
  if (req.body.attributes || req.body.attributeGroups) {
    const groupIds: string[] = req.body.attributeGroups || (existing.get('attributeGroups') as any) || [];
    const normalized = await validateEntityAttributes({
      attributeGroupIds: groupIds,
      values: req.body.attributes,
      existingValues: (existing.get('attributes') as any) || {},
      isUpdate: true,
    });
    req.body.attributes = normalized;
  }
  const updated = await ItemType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, { code: 'itemtype.updated', message: 'ItemType updated', data: updated });
};

export const deleteItemType = async (req: Request, res: Response) => {
  // Restrict delete if items exist for this item type
  const it = await ItemType.findById(req.params.id);
  if (!it) return sendError(res, { status: 404, code: 'itemtype.not_found', message: 'ItemType not found' });
  const itemCount = await Item.countDocuments({ itemType: it._id });
  if (itemCount > 0) {
    return sendError(res, { status: 409, code: 'itemtype.delete_restricted', message: 'Cannot delete ItemType while items exist' });
  }
  const doc = await ItemType.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'itemtype.not_found', message: 'ItemType not found' });
  return sendSuccess(res, { code: 'itemtype.deleted', message: 'ItemType deleted', data: { id: doc._id } });
};

// List categories for an ItemType (by Category.itemType linkage)
export const listCategoriesByItemType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await Category.find({ itemType: id }).sort({ name: 1 });
  return sendSuccess(res, { code: 'itemtype.categories', message: 'OK', data: items, meta: { count: items.length } });
};
