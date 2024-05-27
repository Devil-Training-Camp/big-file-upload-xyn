import { Context } from 'koa';
import fs from 'fs';
import path from 'path';

export async function uploadChunk(ctx: Context) {
  const { files, body } = ctx.request;
  if (!files || !files.chunk) {
    ctx.throw(400, 'No chunk uploaded');
  }

  // 
  const chunk = files.chunk as any;
  const { start, end } = body;
  const chunkPath = path.join(__dirname, 'uploads', `chunk-${start}-${end}`);

  // 保存分片到服务器
  const reader = fs.createReadStream(chunk.path);
  const writer = fs.createWriteStream(chunkPath);
  reader.pipe(writer);

  ctx.body = { message: '分片上传成功' };
}
