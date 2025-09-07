import { Request, Response } from 'express';
import { Association, entityModels, type EntityModel } from '../models/Association';
import { ItemType } from '../models/ItemType';
import { Category } from '../models/Category';
import { Family } from '../models/Family';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

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
    return sendError(res, { status: 400, code: 'association.invalid_model', message: 'Invalid model names' });
  }
  if (fromModel === toModel && String(fromId) === String(toId)) {
    return sendError(res, { status: 400, code: 'association.self', message: 'Self-association is not allowed' });
  }
  await ensureExists(fromModel, fromId);
  await ensureExists(toModel, toId);
  const doc = await Association.create({ fromModel, fromId, toModel, toId, kind, metadata });
  return sendCreated(res, { code: 'association.created', message: 'Association created', data: doc });
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
  return sendSuccess(res, { code: 'association.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getAssociation = async (req: Request, res: Response) => {
  const doc = await Association.findById(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'association.not_found', message: 'Association not found' });
  return sendSuccess(res, { code: 'association.get', message: 'OK', data: doc });
};

export const deleteAssociation = async (req: Request, res: Response) => {
  const doc = await Association.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'association.not_found', message: 'Association not found' });
  return sendSuccess(res, { code: 'association.deleted', message: 'Association deleted', data: { id: doc._id } });
};
