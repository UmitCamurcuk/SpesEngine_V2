import { Request, Response } from 'express';
import { Association, entityModels, type EntityModel } from '../models/Association';
import { ItemType } from '../models/ItemType';
import { Category } from '../models/Category';
import { Family } from '../models/Family';

const modelMap: Record<EntityModel, any> = {
  ItemType,
  Category,
  Family,
};

const ensureExists = async (model: EntityModel, id: string) => {
  const M = modelMap[model];
  const doc = await M.findById(id).lean();
  if (!doc) throw Object.assign(new Error(`${model} not found`), { status: 404 });
};

export const createAssociation = async (req: Request, res: Response) => {
  const { fromModel, fromId, toModel, toId, kind, metadata } = req.body as {
    fromModel: EntityModel; fromId: string; toModel: EntityModel; toId: string; kind?: string; metadata?: any;
  };
  if (!entityModels.includes(fromModel) || !entityModels.includes(toModel)) {
    return res.status(400).json({ message: 'Invalid model names' });
  }
  if (fromModel === toModel && String(fromId) === String(toId)) {
    return res.status(400).json({ message: 'Self-association is not allowed' });
  }
  await ensureExists(fromModel, fromId);
  await ensureExists(toModel, toId);
  const doc = await Association.create({ fromModel, fromId, toModel, toId, kind, metadata });
  res.status(201).json(doc);
};

export const listAssociations = async (req: Request, res: Response) => {
  const { fromModel, fromId, toModel, toId, kind } = req.query as any;
  const filter: any = {};
  if (fromModel) filter.fromModel = fromModel;
  if (fromId) filter.fromId = fromId;
  if (toModel) filter.toModel = toModel;
  if (toId) filter.toId = toId;
  if (kind) filter.kind = kind;
  const items = await Association.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

export const getAssociation = async (req: Request, res: Response) => {
  const doc = await Association.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Association not found' });
  res.json(doc);
};

export const deleteAssociation = async (req: Request, res: Response) => {
  const doc = await Association.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Association not found' });
  res.status(204).send();
};

