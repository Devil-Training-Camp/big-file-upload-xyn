// 文件分片接口
export interface IFileChunk {
  file: Blob
  chunkIndex: number
  uploaded: boolean
}