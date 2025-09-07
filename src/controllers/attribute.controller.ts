import { Request, Response } from 'express';
import { Attribute } from '../models/Attribute';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.create(req.body);
  return sendCreated(res, { code: 'attribute.created', message: 'Attribute created', data: doc });
};

export const listAttributes = async (_req: Request, res: Response) => {
  const items = await Attribute.find().sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'attribute.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findById(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'attribute.not_found', message: 'Attribute not found' });
  return sendSuccess(res, { code: 'attribute.get', message: 'OK', data: doc });
};

export const updateAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return sendError(res, { status: 404, code: 'attribute.not_found', message: 'Attribute not found' });
  return sendSuccess(res, { code: 'attribute.updated', message: 'Attribute updated', data: doc });
};

export const deleteAttribute = async (req: Request, res: Response) => {
  const doc = await Attribute.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'attribute.not_found', message: 'Attribute not found' });
  return sendSuccess(res, { code: 'attribute.deleted', message: 'Attribute deleted', data: { id: doc._id } });
};
