import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AttributeGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    attributes: [{ type: Schema.Types.ObjectId, ref: 'Attribute' }],
  },
  { timestamps: true }
);

AttributeGroupSchema.index({ name: 1 });

export type AttributeGroupDoc = InferSchemaType<typeof AttributeGroupSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AttributeGroup = mongoose.model('AttributeGroup', AttributeGroupSchema);

