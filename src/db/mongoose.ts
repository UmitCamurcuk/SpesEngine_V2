import mongoose from 'mongoose';

export const connectMongo = async (uri: string) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
};

