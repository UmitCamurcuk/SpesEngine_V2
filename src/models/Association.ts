import mongoose, { Schema, InferSchemaType } from 'mongoose';

export const entityModels = ['ItemType', 'Category', 'Family'] as const;
export type EntityModel = typeof entityModels[number];

const AssociationSchema = new Schema(
  {
    fromModel: { type: String, enum: entityModels, required: true },
    fromId: { type: Schema.Types.ObjectId, required: true },
    toModel: { type: String, enum: entityModels, required: true },
    toId: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, default: 'relates' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AssociationSchema.index(
  { fromModel: 1, fromId: 1, toModel: 1, toId: 1, kind: 1 },
  { unique: true }
);
AssociationSchema.index({ toModel: 1, toId: 1 });

export type AssociationDoc = InferSchemaType<typeof AssociationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Association = mongoose.model('Association', AssociationSchema);

