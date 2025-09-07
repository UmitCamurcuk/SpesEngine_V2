import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

SessionSchema.index({ user: 1, createdAt: -1 });
SessionSchema.index({ expiresAt: 1 });

export type SessionDoc = InferSchemaType<typeof SessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Session = mongoose.model('Session', SessionSchema);

