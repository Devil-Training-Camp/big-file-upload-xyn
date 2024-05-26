// 引入所需的模块
import Koa from 'koa'
import { koaBody } from 'koa-body'
import { uploadChunk } from './upload'
import { checkHash } from './hash'

const app = new Koa()

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody({ multipart: true, json: true }))

// 绑定哈希值检查路由
app.get('/checkHash', checkHash)

// 绑定文件分片上传路由
app.post('/uploadChunk', uploadChunk)

export default app
