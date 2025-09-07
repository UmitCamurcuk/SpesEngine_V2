import mongoose, { Schema, InferSchemaType } from 'mongoose';

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    // Map: permissionCode -> boolean (grant)
    grants: { type: Map, of: Boolean, default: {} },
    isAdmin: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoleSchema.index({ code: 1 }, { unique: true });

export type RoleDoc = InferSchemaType<typeof RoleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Role = mongoose.model('Role', RoleSchema);

