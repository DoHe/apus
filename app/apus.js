import { fileURLToPath } from 'url';

export default {
  port: 9090,
  logLevel: 'log',
  rootDir: fileURLToPath(new URL('.', import.meta.url)),
};
