import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ItemType } from '../models/ItemType';
import { Association } from '../models/Association';
import { sendCreated, sendError, sendSuccess } from '../utils/response';
import { validateEntityAttributes } from '../utils/attributeValidation';
import { Family } from '../models/Family';
import { Item } from '../models/Item';

export const createCategory = async (req: Request, res: Response) => {
  if (Object.prototype.hasOwnProperty.call(req.body, 'attributes')) {
    return sendError(res, { status: 400, code: 'category.attributes_on_create', message: 'Attributes cannot be provided on create. Provide only attributeGroups; set attributes via PATCH.' });
  }
  const { itemTypeId } = req.body as { itemTypeId?: string };
  if (itemTypeId) {
    const it = await ItemType.findById(itemTypeId).lean();
    if (!it) return sendError(res, { status: 404, code: 'itemtype.not_found', message: 'ItemType not found' });
  }
  // Clean helper field from payload
  if (itemTypeId) {
    (req.body as any).itemType = itemTypeId;
    delete (req.body as any).itemTypeId;
  }

  const doc = await Category.create(req.body);
  if (itemTypeId) {
    await Association.create({ fromModel: 'Category', fromId: doc._id, toModel: 'ItemType', toId: itemTypeId, kind: 'belongs_to' });
  }
  return sendCreated(res, { code: 'category.created', message: 'Category created', data: doc });
};

export const listCategories = async (_req: Request, res: Response) => {
  const items = await Category.find().populate('itemType').sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'category.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getCategory = async (req: Request, res: Response) => {
  const doc = await Category.findById(req.params.id).populate('itemType');
  if (!doc) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  return sendSuccess(res, { code: 'category.get', message: 'OK', data: doc });
};

export const updateCategory = async (req: Request, res: Response) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  // Guard removing attribute groups while items exist for this category
  if (Array.isArray(req.body.attributeGroups)) {
    const prev: string[] = ((existing.get('attributeGroups') as any) || []).map((x: any) => String(x));
    const next: string[] = (req.body.attributeGroups || []).map((x: any) => String(x));
    const removed = prev.filter((p) => !next.includes(p));
    if (removed.length > 0) {
      const itemCount = await Item.countDocuments({ category: existing._id });
      if (itemCount > 0) {
        return sendError(res, { status: 409, code: 'category.groups_remove_restricted', message: 'Cannot remove attribute groups while items exist for this category' });
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
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, { code: 'category.updated', message: 'Category updated', data: updated });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  // Restrict if any family belongs to this category
  const familyCount = await Family.countDocuments({ category: cat._id });
  if (familyCount > 0) return sendError(res, { status: 409, code: 'category.delete_restricted_families', message: 'Cannot delete category while families exist for it' });
  // Restrict if any item belongs to this category
  const itemCount = await Item.countDocuments({ category: cat._id });
  if (itemCount > 0) return sendError(res, { status: 409, code: 'category.delete_restricted_items', message: 'Cannot delete category while items exist for it' });
  // Restrict if any ItemType references this category (if used that way)
  const itCount = await ItemType.countDocuments({ category: cat._id });
  if (itCount > 0) return sendError(res, { status: 409, code: 'category.delete_restricted_itemtypes', message: 'Cannot delete category while item types reference it' });
  const doc = await Category.findByIdAndDelete(req.params.id);
  return sendSuccess(res, { code: 'category.deleted', message: 'Category deleted', data: { id: doc!._id } });
};

// List families for a category
export const listFamiliesByCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await Family.find({ category: id }).sort({ name: 1 });
  return sendSuccess(res, { code: 'category.families', message: 'OK', data: items, meta: { count: items.length } });
};

export const getCategoryTree = async (_req: Request, res: Response) => {
  const categories = await Category.find().lean();
  const byParent = new Map<string, any[]>();
  for (const c of categories) {
    const key = c.parent ? String(c.parent) : 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const build = (parentKey: string | null) => {
    const key = parentKey ? parentKey : 'root';
    const children = byParent.get(key) || [];
    return children.map((c) => ({ ...c, children: build(String(c._id)) }));
  };
  const tree = build(null);
  return sendSuccess(res, { code: 'category.tree', message: 'OK', data: tree, meta: { count: categories.length } });
};
