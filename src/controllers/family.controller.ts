import { Request, Response } from 'express';
import { Family } from '../models/Family';
import { Category } from '../models/Category';
import { Association } from '../models/Association';
import { validateEntityAttributes } from '../utils/attributeValidation';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createFamily = async (req: Request, res: Response) => {
  if (Object.prototype.hasOwnProperty.call(req.body, 'attributes')) {
    return sendError(res, { status: 400, code: 'family.attributes_on_create', message: 'Attributes cannot be provided on create. Provide only attributeGroups; set attributes via PATCH.' });
  }
  const { categoryId } = req.body as { categoryId?: string };
  if (categoryId) {
    const cat = await Category.findById(categoryId).lean();
    if (!cat) return sendError(res, { status: 404, code: 'category.not_found', message: 'Category not found' });
  }
  if (categoryId) {
    (req.body as any).category = categoryId;
    delete (req.body as any).categoryId;
  }

  const doc = await Family.create(req.body);
  if (categoryId) {
    await Association.create({ fromModel: 'Family', fromId: doc._id, toModel: 'Category', toId: categoryId, kind: 'belongs_to' });
  }
  return sendCreated(res, { code: 'family.created', message: 'Family created', data: doc });
};

export const listFamilies = async (_req: Request, res: Response) => {
  const items = await Family.find().populate('category').sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'family.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getFamily = async (req: Request, res: Response) => {
  const doc = await Family.findById(req.params.id).populate('category');
  if (!doc) return sendError(res, { status: 404, code: 'family.not_found', message: 'Family not found' });
  return sendSuccess(res, { code: 'family.get', message: 'OK', data: doc });
};

export const updateFamily = async (req: Request, res: Response) => {
  const existing = await Family.findById(req.params.id);
  if (!existing) return sendError(res, { status: 404, code: 'family.not_found', message: 'Family not found' });
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
  const updated = await Family.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return sendSuccess(res, { code: 'family.updated', message: 'Family updated', data: updated });
};

export const deleteFamily = async (req: Request, res: Response) => {
  const doc = await Family.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'family.not_found', message: 'Family not found' });
  return sendSuccess(res, { code: 'family.deleted', message: 'Family deleted', data: { id: doc._id } });
};

export const getFamilyTree = async (_req: Request, res: Response) => {
  const families = await Family.find().lean();
  const byParent = new Map<string, any[]>();
  for (const f of families) {
    const key = f.parent ? String(f.parent) : 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(f);
  }
  const build = (parentKey: string | null) => {
    const key = parentKey ? parentKey : 'root';
    const children = byParent.get(key) || [];
    return children.map((f) => ({ ...f, children: build(String(f._id)) }));
  };
  const tree = build(null);
  return sendSuccess(res, { code: 'family.tree', message: 'OK', data: tree, meta: { count: families.length } });
};
