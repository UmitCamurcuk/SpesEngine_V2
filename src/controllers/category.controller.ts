import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { validateEntityAttributes } from '../utils/attributeValidation';

export const createCategory = async (req: Request, res: Response) => {
  if (req.body.attributes || req.body.attributeGroups) {
    const groupIds: string[] = req.body.attributeGroups || [];
    const normalized = await validateEntityAttributes({ attributeGroupIds: groupIds, values: req.body.attributes, isUpdate: false });
    req.body.attributes = normalized;
  }
  const doc = await Category.create(req.body);
  res.status(201).json(doc);
};

export const listCategories = async (_req: Request, res: Response) => {
  const items = await Category.find().sort({ createdAt: -1 });
  res.json(items);
};

export const getCategory = async (req: Request, res: Response) => {
  const doc = await Category.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Category not found' });
  res.json(doc);
};

export const updateCategory = async (req: Request, res: Response) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });
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
  res.json(updated);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const doc = await Category.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Category not found' });
  res.status(204).send();
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
  res.json(build(null));
};
