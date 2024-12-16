// 引入所需的模块
import Koa from 'koa'
import { koaBody } from 'koa-body'
import Router from 'koa-router';
import { uploadChunk } from './upload'
import { checkHash } from './hash'
import { chunkMerge } from './merge'
import cors from '@koa/cors';

const app = new Koa()
const router = new Router();

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody({ multipart: true, json: true }))

app.use(cors())

// 唯一性检查
router.get('/checkHash', checkHash)

// 文件上传
router.post('/uploadChunk', uploadChunk)

// 文件分片后合并文件
router.post('/chunkMerge', chunkMerge)

app.use(router.routes()).use(router.allowedMethods())

export default app
