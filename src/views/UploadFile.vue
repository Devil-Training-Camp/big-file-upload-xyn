<template>
  <main>
    <FileReceive @file="handleFile" />
    <span class="fileInfo">{{ fileName }}</span>
    <el-progress class="progress" :percentage="uploadProgress"></el-progress>
    <FileOperate @isPause="handleClick" :hasFile="hasFile" :uploadProgress="uploadProgress" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import SparkMD5 from 'spark-md5'
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import {isExisted, uploadChunk} from '../service/file'
import type { IFileChunk } from '../types/interface'

// 定义引用变量
const fileName = ref<string>('')
const chunkSize = 1024 * 1024 * 1 // 分片大小为1MB
let curFile = ref<UploadFile | null>(null)
let isPaused = false
let chunkIndex = 0
const uploadProgress = ref<number>(0)
const hasFile = ref<boolean>(false)

// 接收文件处理
const handleFile = (f: UploadFile) => {
  curFile.value = f
  fileName.value = f.name
  hasFile.value = true
}

// 点击上传/暂停按钮处理
const handleClick = (upload: boolean) => {
  if (upload) {
    isPaused = false
    uploadFile()
    return
  }
  isPaused = true
}

// 上传文件
async function uploadFile() {
  if (!curFile.value) {
    alert('请点击选择或拖入需要上传的文件')
    return false
  }
  const chunkList = getChunkList()
  for (let i = chunkIndex; i < chunkList.length; i++) {
    if (isPaused) {
      chunkIndex = i
      break
    }
    const chunk = chunkList[i]
    const hash = await calculateHash(chunk.file)
    const isAlreadyUploaded = await isExisted(hash)
    if (!isAlreadyUploaded && (await uploadChunk(chunk, hash))) {
      // 限制进度显示小数点后两位
      uploadProgress.value = parseFloat((((i + 1) / chunkList.length) * 100).toFixed(2));
    }
  }
}

// 计算文件哈希值
function calculateHash(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target) {
        const arrayBuffer = event.target.result as ArrayBuffer
        const spark = new SparkMD5.ArrayBuffer()
        spark.append(arrayBuffer)
        resolve(spark.end())
      }
      reject(new Error('文件为空'))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}


// 获取文件分片列表
function getChunkList(): IFileChunk[] {
  const chunkList: IFileChunk[] = []
  let start = 0
  let index = 0

  if (curFile.value?.raw) {
    const fileSize = curFile.value.raw.size
    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize)
      const chunk = curFile.value.raw.slice(start, end)
      chunkList.push({ file: chunk, chunkIndex: index++, uploaded: false, start, end})
      start = end
    }
  }
  return chunkList
}

</script>

<style lang="less" scoped>
.fileInfo {
  font-size: 13px;
  margin: 5px 0;
}
.progress {
  margin: 5px 0 0 0;
}
</style>
