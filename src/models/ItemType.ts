import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ItemTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    attributeGroups: [{ type: Schema.Types.ObjectId, ref: 'AttributeGroup' }],
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ItemTypeSchema.index({ name: 1 });

export type ItemTypeDoc = InferSchemaType<typeof ItemTypeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ItemType = mongoose.model('ItemType', ItemTypeSchema);
