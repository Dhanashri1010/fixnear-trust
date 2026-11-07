import { defineConfig } from 'vitest/config';
import crypto from 'crypto';
import fs from 'fs';

const defaultWindowsBinary = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const systemBinary = process.env.MONGOMS_SYSTEM_BINARY || (fs.existsSync(defaultWindowsBinary) ? defaultWindowsBinary : undefined);

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: crypto.randomBytes(32).toString('hex'),
      ...(systemBinary ? { MONGOMS_SYSTEM_BINARY: systemBinary } : {}),
    },
  },
});
