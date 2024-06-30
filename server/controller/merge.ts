import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, '.cache')
const uploadDir = path.join(__dirname, 'uploads')

export const chunkMerge = async (ctx) => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }
    const { hash, filename } = ctx.request.body
    const filePath = path.join(uploadDir, filename)
    const chunkDir = path.join(cacheDir, hash)
    const chunks = fs.readdirSync(chunkDir).sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))

    const writeStream = fs.createWriteStream(filePath)

    for (let chunk of chunks) {
        const chunkPath = path.join(chunkDir, chunk)
        const data = fs.readFileSync(chunkPath)
        writeStream.write(data)
        fs.unlinkSync(chunkPath)
    }

    writeStream.end()
    fs.rmdirSync(chunkDir)

    ctx.body = { success: true, filePath }
}
