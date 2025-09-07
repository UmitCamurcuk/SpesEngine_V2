import { Request, Response } from 'express';
import { Family } from '../models/Family';
import { Category } from '../models/Category';
import { Association } from '../models/Association';
import { validateEntityAttributes } from '../utils/attributeValidation';

export const createFamily = async (req: Request, res: Response) => {
  if (Object.prototype.hasOwnProperty.call(req.body, 'attributes')) {
    return res.status(400).json({ message: 'Attributes cannot be provided on create. Provide only attributeGroups; set attributes via PATCH.' });
  }
  const { categoryId } = req.body as { categoryId?: string };
  if (categoryId) {
    const cat = await Category.findById(categoryId).lean();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
  }
  if (categoryId) delete (req.body as any).categoryId;

  const doc = await Family.create(req.body);
  if (categoryId) {
    await Association.create({ fromModel: 'Family', fromId: doc._id, toModel: 'Category', toId: categoryId, kind: 'belongs_to' });
  }
  res.status(201).json(doc);
};

export const listFamilies = async (_req: Request, res: Response) => {
  const items = await Family.find().sort({ createdAt: -1 });
  res.json(items);
};

export const getFamily = async (req: Request, res: Response) => {
  const doc = await Family.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Family not found' });
  res.json(doc);
};

export const updateFamily = async (req: Request, res: Response) => {
  const existing = await Family.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Family not found' });
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
  res.json(updated);
};

export const deleteFamily = async (req: Request, res: Response) => {
  const doc = await Family.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Family not found' });
  res.status(204).send();
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
  res.json(build(null));
};
