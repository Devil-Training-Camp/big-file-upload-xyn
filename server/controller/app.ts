// 引入所需的模块
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from 'koa-router';
import { uploadChunk } from './upload'
import { checkHash } from './hash'
import cors from '@koa/cors';

const app = new Koa()
const router = new Router();

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody({ multipart: true, json: true }))

app.use(cors())

// 绑定哈希值检查路由
router.get('/checkHash', checkHash)

// 绑定文件分片上传路由
router.post('/uploadChunk', uploadChunk)

//TODO 文件分片后合并文件逻辑
// 好像并没有吧文件分片合并还原成原始文件的逻辑？

app.use(router.routes()).use(router.allowedMethods())

export default app
