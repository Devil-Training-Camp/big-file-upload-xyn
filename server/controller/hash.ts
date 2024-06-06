import { Context } from 'koa'
import fs from 'fs'
import path from 'path'
// 这个类并没有用到
import SparkMD5 from 'spark-md5'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const hashFilePath = path.join(__dirname, 'fileHashes.json')

// 初始化哈希存储文件
if (!fs.existsSync(hashFilePath)) {
  fs.writeFileSync(hashFilePath, JSON.stringify({}))
}

// 读取哈希存储文件
function readHashes() {
  const data = fs.readFileSync(hashFilePath, 'utf-8')
  return JSON.parse(data)
}

// 写入哈希存储文件
function writeHashes(hashes: { [key: string]: string }) {
  fs.writeFileSync(hashFilePath, JSON.stringify(hashes, null, 2))
}

// 检查哈希值是否存在并存储
export async function checkHash(ctx: Context) {
  const { hash } = ctx.query
  if (!hash || typeof hash !== 'string') {
    ctx.throw(400, 'Invalid hash')
  }

  const hashes = readHashes()

  // 检查哈希值是否存在
  // 没懂，这是通过 hash 来判断文件是否存在？这不合理吧？
  // 比如， hashFilePath 有相关记录，但实际文件已经被删除了，这不就 gg 了？
  // 更好的方式应该跟教学项目那样，直接以 hash 值命名 chunk 文件，之后保存下来
  if (hashes[hash]) {
    ctx.body = { exists: true, filePath: hashes[hash] }
  } else {
    ctx.body = { exists: false }
  }
}

// 存储哈希值
// 翻了一下，这个方法似乎并没有被使用到？
export async function storeHash(ctx: Context) {
  const { hash, filePath } = ctx.request.body
  if (!hash || !filePath || typeof hash !== 'string' || typeof filePath !== 'string') {
    ctx.throw(400, 'Invalid hash or file path')
  }

  const hashes = readHashes()

  // 存储新的哈希值和文件路径
  hashes[hash] = filePath
  writeHashes(hashes)

  ctx.body = { message: 'Hash stored successfully' }
}
