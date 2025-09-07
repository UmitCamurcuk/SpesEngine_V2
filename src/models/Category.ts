import mongoose, { Schema, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    attributeGroups: [{ type: Schema.Types.ObjectId, ref: 'AttributeGroup' }],
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1 });
CategorySchema.index({ parent: 1 });

CategorySchema.pre('save', async function (next) {
  const self = this as any;
  if (!self.isModified('parent')) return next();
  if (!self.parent) {
    self.ancestors = [];
    return next();
  }
  const parent = await Category.findById(self.parent);
  if (!parent) return next(new Error('Parent category not found'));
  self.ancestors = [...(parent.ancestors || []), parent._id];
  next();
});

export type CategoryDoc = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Category = mongoose.model('Category', CategorySchema);
