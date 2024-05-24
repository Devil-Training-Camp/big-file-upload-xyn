// 引入所需的模块
import Koa from 'koa';
import { koaBody } from 'koa-body';
import { uploadFile } from './upload';
import { checkHash } from './hash';

const app = new Koa();

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody({ multipart: true }));

// 绑定文件上传路由
app.post('/upload', uploadFile);

// 绑定哈希值检查路由
app.get('/checkHash', checkHash);

export default app;

