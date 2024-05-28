<template>
  <main>
    <FileReceive @file="handleFile" />
    <span>{{ fileName }}</span>
    <el-progress :percentage="uploadProgress"></el-progress>
    <FileOperate @upload="handleClick" :isUploaded="isUploaded" :uploadProgress="uploadProgress" />
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
let uploadTotalProgress = ref<number>(0)

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
}

// 点击上传时开始上传文件
const handleClick = (upload: boolean) => {
  if (!curFile.value) {
    // ElMessage.error('请点击选择或拖入需要上传的文件')
    alert('请点击选择或拖入需要上传的文件')
    return false
  }
  if (upload) {
    uploadFile()
    return true
  }
  isPaused = true
}

async function uploadFile() {
  // 文件分片
  // 计算每一个分片的计算hash值用于判断是否进行上传
  // 获取每一个文件上传分片 判断是否已经上传过，没上传的上传，之后更新进度
  const chunkList = getChunkList()
  uploadTotalProgress.value = chunkList.length
  for (let i = chunkIndex; i < chunkList.length; i++) {
    if (isPaused) {
      chunkIndex = i
      break
    }
    const chunk = chunkList[i]
    const hash = calculateHash(chunk.file)
    const isAlreadyUploaded = isExisted(await hash)
    if (!isAlreadyUploaded) {
      await uploadChunk(chunk)
    }
    uploadProgress.value = ((i + 1) / chunkList.length) * 100
  }
  // 文件上传成功 传递结束标志，更新进度
  isUploaded.value = true
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
  let start = 0,
    end = 0
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
async function uploadChunk(chunk: IFileChunk) {
  const formData = new FormData()
  formData.append('chunk', chunk.file)
  // TODO
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

    console.log('chunk上传成功')
  } catch (error) {
    console.error('uploadChunk error:' + error)
  }
}
</script>

<style lang="less" scoped></style>
