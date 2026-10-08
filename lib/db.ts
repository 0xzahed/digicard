import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";

declare global {
  // eslint-disable-next-line no-var
  var __dcMongoose: Promise<typeof mongoose> | undefined;
}

/** Connect once per server instance. Null when no URI is configured. */
export async function db(): Promise<typeof mongoose | null> {
  if (!uri) return null;
  if (!global.__dcMongoose) {
    global.__dcMongoose = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  }
  try {
    return await global.__dcMongoose;
  } catch {
    global.__dcMongoose = undefined;
    return null;
  }
}
