import { Request, Response } from 'express';
import { Attribute } from '../models/Attribute';

export const createAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.create(req.body);
  res.status(201).json(doc);
};

export const listAttributes = async (_req: Request, res: Response) => {
  const items = await Attribute.find().sort({ createdAt: -1 });
  res.json(items);
};

export const getAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Attribute not found' });
  res.json(doc);
};

export const updateAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Attribute not found' });
  res.json(doc);
};

export const deleteAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Attribute not found' });
  res.status(204).send();
};

