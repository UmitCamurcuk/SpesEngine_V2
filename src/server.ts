import dotenv from 'dotenv';
dotenv.config();

import { loadEnv } from './config/env';
import { connectMongo } from './db/mongoose';
import { createApp } from './app';

async function main() {
  const env = loadEnv();
  await connectMongo(env.MONGO_URI);
  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.PORT} (docs at /docs)`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

