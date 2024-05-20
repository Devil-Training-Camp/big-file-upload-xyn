// 引入所需的模块
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');

// 创建一个 Koa 应用程序和路由
const app = new Koa();
const router = new Router();

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody({ multipart: true }));

// 处理文件上传的路由
router.post('/upload', async (ctx) => {
  const file = ctx.request.files.file; // 获取上传的文件对象
  const fileName = file.name; // 获取文件名
  console.log('Received file:', fileName);
  
  // 在真实应用中，你可能需要将文件保存到服务器上，然后返回文件路径或其他相关信息
  
  // 将文件名发送回客户端
  ctx.body = { fileName };
});

// 将路由注册到 Koa 应用程序中
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
