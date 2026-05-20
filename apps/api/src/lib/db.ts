import mongoose from 'mongoose';

let cached: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (cached) return cached;
  cached = await mongoose.connect(uri, { bufferCommands: false });
  return cached;
}
