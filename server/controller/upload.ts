import fs from 'fs';
import { Context } from 'koa';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前模块的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadChunk(ctx: Context) {
  const { files, body } = ctx.request;
  
  if (!files || !files.chunk) {
    ctx.throw(400, '分片不存在');
  }

  const chunk = files.chunk as any;
  const { hash, index } = body;

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const chunkDir = path.join(uploadsDir, hash);
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }
  
  const chunkPath = path.join(chunkDir, `chunk-${index}`);

  try {
    // 保存分片到服务器
    const reader = fs.createReadStream(chunk.filepath);
    const writer = fs.createWriteStream(chunkPath);
    reader.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    ctx.body = { message: '分片上传成功' };
  } catch (error) {
    console.error('文件上传错误:', error);
    ctx.throw(500, '文件上传失败');
  }
}
