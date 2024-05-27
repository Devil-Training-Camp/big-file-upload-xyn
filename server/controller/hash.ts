import { Context } from 'koa'
import fs from 'fs'
import path from 'path'
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
  if (hashes[hash]) {
    ctx.body = { exists: true, filePath: hashes[hash] }
  } else {
    ctx.body = { exists: false }
  }
}

// 存储哈希值
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
