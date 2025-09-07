import mongoose, { Schema, InferSchemaType } from 'mongoose';

const FamilySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Family' }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    attributeGroups: [{ type: Schema.Types.ObjectId, ref: 'AttributeGroup' }],
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

FamilySchema.index({ name: 1 });
FamilySchema.index({ parent: 1 });

FamilySchema.pre('save', async function (next) {
  const self = this as any;
  if (!self.isModified('parent')) return next();
  if (!self.parent) {
    self.ancestors = [];
    return next();
  }
  const parent = await Family.findById(self.parent);
  if (!parent) return next(new Error('Parent family not found'));
  self.ancestors = [...(parent.ancestors || []), parent._id];
  next();
});

export type FamilyDoc = InferSchemaType<typeof FamilySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Family = mongoose.model('Family', FamilySchema);
