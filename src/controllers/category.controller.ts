import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ItemType } from '../models/ItemType';
import { Association } from '../models/Association';
import { sendCreated, sendError, sendSuccess } from '../utils/response';
import { validateEntityAttributes } from '../utils/attributeValidation';

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
  if (itemTypeId) delete (req.body as any).itemTypeId;

  const doc = await Category.create(req.body);
  if (itemTypeId) {
    await Association.create({ fromModel: 'Category', fromId: doc._id, toModel: 'ItemType', toId: itemTypeId, kind: 'belongs_to' });
  }
  return sendCreated(res, { code: 'category.created', message: 'Category created', data: doc });
};

export const listCategories = async (_req: Request, res: Response) => {
  const items = await Category.find().sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'category.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getCategory = async (req: Request, res: Response) => {
  const doc = await Category.findById(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  return sendSuccess(res, { code: 'category.get', message: 'OK', data: doc });
};

export const updateCategory = async (req: Request, res: Response) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
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
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return sendSuccess(res, { code: 'category.updated', message: 'Category updated', data: updated });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const doc = await Category.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  return sendSuccess(res, { code: 'category.deleted', message: 'Category deleted', data: { id: doc._id } });
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
