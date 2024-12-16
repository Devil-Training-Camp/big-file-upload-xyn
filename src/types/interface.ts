import type { UploadFile } from 'element-plus'

export interface IFileChunk {
  file: Blob
  chunkIndex: number
  uploaded: boolean
}

export interface IUploadFileArray {
  file: UploadFile,
  progress: number,
  hash: string,
  chunkIndex: number // 记录该文件分片上传进度
}