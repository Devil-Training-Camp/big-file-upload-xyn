import type { IFileChunk } from '../types/interface';
import type { UploadFile } from 'element-plus'

const chunkSize = 1024 * 1024 * 1 // 分片大小为1MB;

export function getChunkList(curFile:UploadFile | null): IFileChunk[] {
    const chunkList: IFileChunk[] = []
    let start = 0
    let index = 0
  
    if (curFile?.raw) {
      const fileSize = curFile.raw.size
      while (start < fileSize) {
        const end = Math.min(start + chunkSize, fileSize)
        const chunk = curFile.raw.slice(start, end)
        chunkList.push({ file: chunk, chunkIndex: index++, uploaded: false})
        start = end
      }
    }
    return chunkList
  }