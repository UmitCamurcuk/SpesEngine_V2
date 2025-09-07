import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    itemType: { type: Schema.Types.ObjectId, ref: 'ItemType', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    family: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
    attributes: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ItemSchema.index({ name: 1 });
ItemSchema.index({ code: 1 }, { unique: true });
ItemSchema.index({ itemType: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ family: 1 });

export type ItemDoc = InferSchemaType<typeof ItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Item = mongoose.model('Item', ItemSchema);

