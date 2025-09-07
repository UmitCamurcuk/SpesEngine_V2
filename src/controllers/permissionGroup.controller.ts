import { Request, Response } from 'express';
import { PermissionGroup } from '../models/PermissionGroup';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createPermissionGroup = async (req: Request, res: Response) => {
  const doc = await PermissionGroup.create(req.body);
  return sendCreated(res, { code: 'permission_group.created', message: 'PermissionGroup created', data: doc });
};

export const listPermissionGroups = async (_req: Request, res: Response) => {
  const items = await PermissionGroup.find().sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'permission_group.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getPermissionGroup = async (req: Request, res: Response) => {
  const doc = await PermissionGroup.findById(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'permission_group.not_found', message: 'PermissionGroup not found' });
  return sendSuccess(res, { code: 'permission_group.get', message: 'OK', data: doc });
};

export const updatePermissionGroup = async (req: Request, res: Response) => {
  const doc = await PermissionGroup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return sendError(res, { status: 404, code: 'permission_group.not_found', message: 'PermissionGroup not found' });
  return sendSuccess(res, { code: 'permission_group.updated', message: 'PermissionGroup updated', data: doc });
};

export const deletePermissionGroup = async (req: Request, res: Response) => {
  const doc = await PermissionGroup.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'permission_group.not_found', message: 'PermissionGroup not found' });
  return sendSuccess(res, { code: 'permission_group.deleted', message: 'PermissionGroup deleted', data: { id: doc._id } });
};

