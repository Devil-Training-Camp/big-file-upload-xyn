import { Context } from 'koa';
import fs from 'fs';
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
  const { start, end } = body;

  // 确保 start 和 end 是定义的
  if (typeof start === 'undefined' || typeof end === 'undefined') {
    ctx.throw(400, 'start 或 end 参数未定义');
  }

  // 确保 uploads 目录存在
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // 定义保存分片的路径
  const chunkPath = path.join(uploadsDir, `chunk-${start}-${end}`);
  
  try {
    // 保存分片到服务器
    const reader = fs.createReadStream(chunkPath);
    const writer = fs.createWriteStream(chunkPath);
    reader.pipe(writer);

    // 确保写入完成
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
