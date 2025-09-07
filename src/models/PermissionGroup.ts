import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PermissionSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const PermissionGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    permissions: { type: [PermissionSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PermissionGroupSchema.index({ code: 1 }, { unique: true });

export type PermissionGroupDoc = InferSchemaType<typeof PermissionGroupSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PermissionGroup = mongoose.model('PermissionGroup', PermissionGroupSchema);

