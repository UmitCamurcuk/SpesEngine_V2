import { Request, Response } from 'express';
import { ItemType } from '../models/ItemType';
import { validateEntityAttributes } from '../utils/attributeValidation';

export const createItemType = async (req: Request, res: Response) => {
  if (req.body.attributes || req.body.attributeGroups) {
    const groupIds: string[] = req.body.attributeGroups || [];
    const normalized = await validateEntityAttributes({ attributeGroupIds: groupIds, values: req.body.attributes, isUpdate: false });
    req.body.attributes = normalized;
  }
  const doc = await ItemType.create(req.body);
  res.status(201).json(doc);
};

export const listItemTypes = async (_req: Request, res: Response) => {
  const items = await ItemType.find().sort({ createdAt: -1 });
  res.json(items);
};

export const getItemType = async (req: Request, res: Response) => {
  const doc = await ItemType.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'ItemType not found' });
  res.json(doc);
};

export const updateItemType = async (req: Request, res: Response) => {
  const existing = await ItemType.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'ItemType not found' });
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
  const updated = await ItemType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteItemType = async (req: Request, res: Response) => {
  const doc = await ItemType.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'ItemType not found' });
  res.status(204).send();
};
