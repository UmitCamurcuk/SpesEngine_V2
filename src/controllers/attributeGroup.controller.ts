import { Request, Response } from 'express';
import { AttributeGroup } from '../models/AttributeGroup';

export const createAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.create(req.body);
  res.status(201).json(doc);
};

export const listAttributeGroups = async (_req: Request, res: Response) => {
  const items = await AttributeGroup.find().populate('attributes').sort({ createdAt: -1 });
  res.json(items);
};

export const getAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findById(req.params.id).populate('attributes');
  if (!doc) return res.status(404).json({ message: 'AttributeGroup not found' });
  res.json(doc);
};

export const updateAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('attributes');
  if (!doc) return res.status(404).json({ message: 'AttributeGroup not found' });
  res.json(doc);
};

export const deleteAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'AttributeGroup not found' });
  res.status(204).send();
};

