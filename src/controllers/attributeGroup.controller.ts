import { Request, Response } from 'express';
import { AttributeGroup } from '../models/AttributeGroup';
import { sendCreated, sendError, sendSuccess } from '../utils/response';
import { ItemType } from '../models/ItemType';
import { Category } from '../models/Category';
import { Family } from '../models/Family';
import { Attribute } from '../models/Attribute';

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
  const ag = await AttributeGroup.findById(req.params.id);
  if (!ag) return sendError(res, { status: 404, code: 'attribute_group.not_found', message: 'AttributeGroup not found' });
  // Restrict if the group has attributes inside
  const attrCount = await Attribute.countDocuments({ _id: { $in: ag.attributes as any } });
  if (attrCount > 0) {
    return sendError(res, { status: 409, code: 'attribute_group.delete_restricted_attributes', message: 'Cannot delete attribute group while it contains attributes' });
  }
  // Restrict if referenced by ItemType/Category/Family
  const itRefs = await ItemType.countDocuments({ attributeGroups: ag._id });
  const catRefs = await Category.countDocuments({ attributeGroups: ag._id });
  const famRefs = await Family.countDocuments({ attributeGroups: ag._id });
  if (itRefs + catRefs + famRefs > 0) {
    return sendError(res, { status: 409, code: 'attribute_group.delete_restricted_referenced', message: 'Cannot delete attribute group while referenced by item types, categories or families. Remove references first.' });
  }
  const doc = await AttributeGroup.findByIdAndDelete(req.params.id);
  return sendSuccess(res, { code: 'attribute_group.deleted', message: 'AttributeGroup deleted', data: { id: doc!._id } });
};
