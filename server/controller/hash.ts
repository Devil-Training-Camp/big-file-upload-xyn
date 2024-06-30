import fs from 'fs';
import { Context } from 'koa';
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

export const checkHash = (ctx: Context) => {
  const { hash } = ctx.query;

  if (!hash || Array.isArray(hash)) {
    ctx.status = 400;
    ctx.body = { exists: false};
    return;
  }

  const chunkDir = path.join(uploadsDir, hash);

  try {
    if (fs.existsSync(chunkDir)) {
      const chunks = fs.readdirSync(chunkDir).map(chunk => parseInt(chunk.split('-')[1]));
      ctx.body = { exists: true, chunks };
    } else {
      ctx.body = { exists: false };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { exists: false, error: error.message };
  }
}
