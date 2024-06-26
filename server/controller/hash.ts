import { Context } from 'koa'
import fs from 'fs'
import path from 'path'
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

// 检查哈希值是否存在并存储
export async function checkHash(ctx: Context) {
  const { hash } = ctx.query
  if (!hash || typeof hash !== 'string') {
    ctx.throw(400, 'Invalid hash')
  }
  
  // 我还是那个观点，例如上传了文件 a，对应 hash-a
  // 那么存储的文件名可以是 /xxx/.cache/hash-a
  // 之后通过判断 hash 来确定文件是否已经上传，而不是专门用一个文件来记录已经上传的 hash 值，因为编程时应该尽可能保证只有唯一的事实
  // /xxx/.cache/hash-a 是唯一的事实，但 hash.json 不是，因为即使 json 文档里面有，不代表对应的文件真实存在
  //TODO 文件唯一性判定逻辑变更
  /**
   * 文件唯一性判断，不再判断hash值，判断文件存储区域中是否已经存在以该hash值命名的文件 
   * 文件名命名规则：该分片hash值+？ 最后合并分片如何合并？一个文件对应一个hash值还是一个分片对应一个hash值？涉及到后面的分片合并逻辑 
   */
  const hashes = readHashes()

  // 检查哈希值是否存在
  if (hashes[hash]) {
    ctx.body = { exists: true, filePath: hashes[hash] }
  } else {
    ctx.body = { exists: false }
  }
}

