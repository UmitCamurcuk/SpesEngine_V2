import { Request, Response } from 'express';
import { AttributeGroup } from '../models/AttributeGroup';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.create(req.body);
  return sendCreated(res, { code: 'attribute_group.created', message: 'AttributeGroup created', data: doc });
};

export const listAttributeGroups = async (_req: Request, res: Response) => {
  const items = await AttributeGroup.find().populate('attributes').sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'attribute_group.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findById(req.params.id).populate('attributes');
  if (!doc) return sendError(res, { status: 404, code: 'attribute_group.not_found', message: 'AttributeGroup not found' });
  return sendSuccess(res, { code: 'attribute_group.get', message: 'OK', data: doc });
};

export const updateAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('attributes');
  if (!doc) return sendError(res, { status: 404, code: 'attribute_group.not_found', message: 'AttributeGroup not found' });
  return sendSuccess(res, { code: 'attribute_group.updated', message: 'AttributeGroup updated', data: doc });
};

export const deleteAttributeGroup = async (req: Request, res: Response) => {
  const doc = await AttributeGroup.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'attribute_group.not_found', message: 'AttributeGroup not found' });
  return sendSuccess(res, { code: 'attribute_group.deleted', message: 'AttributeGroup deleted', data: { id: doc._id } });
};
