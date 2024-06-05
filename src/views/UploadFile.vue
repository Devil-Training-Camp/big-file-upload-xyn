<template>
  <main>
    <FileReceive @file="handleFile" />
    <span class="fileInfo">{{ fileName }}</span>
    <el-progress class="progress" :percentage="uploadProgress"></el-progress>
    <FileOperate @isPause="handleClick" :hasFile="hasFile" :uploadProgress="uploadProgress" />
  </main>
</template>

<script setup lang="ts">
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import SparkMD5 from 'spark-md5'

const fileName = ref<String>('')
const isUploaded = ref<boolean>(false)
const chunkSize = 1024 * 1024 * 1
let curFile = ref<UploadFile>()
let isPaused = false
let chunkIndex = 0
let uploadProgress = ref<number>(0)
let hasFile = ref<boolean>(false)

interface IFileChunk {
  file: Blob
  chunkIndex: number
  uploaded: boolean
  start: number
  end: number
}

// 接收文件
const handleFile = (f: UploadFile) => {
  curFile.value = f
  fileName.value = f.name
  hasFile.value = true
}

// 点击上传时开始上传文件
const handleClick = (upload: boolean) => {
  if (!curFile.value) {
    alert('请点击选择或拖入需要上传的文件')
    return false
  }
  if (upload) {
    isPaused = false
    uploadFile()
    return
  }
  isPaused = true
}

async function uploadFile() {
  // 文件分片
  const chunkList = getChunkList()
  for (let i = chunkIndex; i < chunkList.length; i++) {
    if (isPaused) {
      chunkIndex = i
      break
    }
    const chunk = chunkList[i]
    const hash = await calculateHash(chunk.file)
    const isAlreadyUploaded = await isExisted(hash)
    if (!isAlreadyUploaded && (await uploadChunk(chunk))) {
      // 限制进度显示小数点后低啊
      uploadProgress.value = parseFloat((((i + 1) / chunkList.length) * 100).toFixed(2));
    }
  }
}

// 判断是否已经上传过
async function isExisted(hash: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3000/checkHash?hash=${hash}`)
    const data = await response.json()
    return data.exists
  } catch (error) {
    console.error('isExisted error:' + error)
    return false
  }
}

// 计算hash值
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

// 文件分片
function getChunkList(): IFileChunk[] {
  let chunkList: IFileChunk[] = []
  let start = 0
  let end = 0
  let index = 0
  if (curFile.value?.raw == undefined || curFile.value?.size == undefined) {
    return []
  }

  while (start <= curFile.value.raw.size) {
    let curChunk = curFile.value.raw.slice(start, start + chunkSize)
    index++
    start += chunkSize
    chunkList.push({
      file: curChunk,
      chunkIndex: index,
      uploaded: false,
      start: start,
      end: start + chunkSize
    })
  }
  return chunkList
}

// 上传分片到服务器
async function uploadChunk(chunk: IFileChunk): Promise<boolean> {
  const formData = new FormData()
  formData.append('chunk', chunk.file)
  formData.append('start', chunk.start.toString())
  formData.append('end', chunk.end.toString())

  try {
    const response = await fetch('http://localhost:3000/uploadChunk', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('chunk上传失败')
    }

    return true
  } catch (error) {
    console.error('uploadChunk error:' + error)
    return false
  }
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
