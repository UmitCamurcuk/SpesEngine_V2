import { Request, Response } from 'express';
import { Role } from '../models/Role';
import { sendCreated, sendError, sendSuccess } from '../utils/response';

export const createRole = async (req: Request, res: Response) => {
  const doc = await Role.create(req.body);
  return sendCreated(res, { code: 'role.created', message: 'Role created', data: doc });
};

export const listRoles = async (_req: Request, res: Response) => {
  const items = await Role.find().sort({ createdAt: -1 });
  return sendSuccess(res, { code: 'role.list', message: 'OK', data: items, meta: { count: items.length } });
};

export const getRole = async (req: Request, res: Response) => {
  const doc = await Role.findById(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'role.not_found', message: 'Role not found' });
  return sendSuccess(res, { code: 'role.get', message: 'OK', data: doc });
};

export const updateRole = async (req: Request, res: Response) => {
  const doc = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return sendError(res, { status: 404, code: 'role.not_found', message: 'Role not found' });
  return sendSuccess(res, { code: 'role.updated', message: 'Role updated', data: doc });
};

export const deleteRole = async (req: Request, res: Response) => {
  const doc = await Role.findByIdAndDelete(req.params.id);
  if (!doc) return sendError(res, { status: 404, code: 'role.not_found', message: 'Role not found' });
  return sendSuccess(res, { code: 'role.deleted', message: 'Role deleted', data: { id: doc._id } });
};

