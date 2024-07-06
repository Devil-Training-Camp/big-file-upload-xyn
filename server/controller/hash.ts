import fs from 'fs';
import { Context } from 'koa';
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

export const checkHash = (ctx: Context) => {
  const { hash } = ctx.query;

  // 这里为啥是 Array.isArray 判断？
  // 理论上判断是否为 string 比较好？
  if (!hash || Array.isArray(hash)) {
    ctx.status = 400;
    ctx.body = { exists: false};
    return;
  }

  const chunkDir = path.join(uploadsDir, hash);

  try {
    // 所有文件同步操作都改成异步操作
    if (fs.existsSync(chunkDir)) {
      const chunks = fs.readdirSync(chunkDir).map(chunk => parseInt(chunk.split('-')[1]));
      ctx.body = { exists: true, chunks };
    } else {
      ctx.body = { exists: false };
    }
    // 这种错误信息处理，最好抽血一下，通过中间件实现
  } catch (error) {
    ctx.status = 500;
    ctx.body = { exists: false, error: error.message };
  }
}
