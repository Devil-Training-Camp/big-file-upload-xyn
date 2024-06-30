<template>
  <main>
    <FileReceive @file="handleFiles" multiple />
    <div v-for="(curfile, index) in files" :key="index">
      <span class="fileInfo">{{ curfile.file.name }}</span>
      <el-progress class="progress" :percentage="curfile.progress"></el-progress>
    </div>
    <FileOperate @isPause="handlePause" :hasFile="hasFile" :uploadProgress="totalProgress"></FileOperate>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import type { IUploadFileArray } from '../types/interface'
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { isExisted, uploadChunk, chunkMerge } from '../service/file'
import { calculateHash } from '../utils/calculateHash'
import { getChunkList } from '../utils/getChunkList'

const files = ref<Array<IUploadFileArray & { chunkIndex: number }>>([])
const isPaused = ref<boolean>(false)
const hasFile = ref<boolean>(false)
const totalProgress = ref<number>(0)

// 接收文件
const handleFiles = async (uploadedFiles: UploadFile | UploadFile[]) => {
  let fileList: UploadFile[] = []

  if (Array.isArray(uploadedFiles)) {
    fileList = uploadedFiles
  } else {
    fileList.push(uploadedFiles)
  }

  const fileObjects = await Promise.all(fileList.map(async file => {
    if (file.raw) {
      const hash = await calculateHash(file.raw as Blob)
      return { file, progress: 0, hash, chunkIndex: 0 }
    }
    throw new Error("File raw error when handleFiles")
  }))
  
  files.value = fileObjects
  hasFile.value = files.value.length > 0
}

// 暂停上传
const handlePause = (upload: boolean) => {
  if (upload) {
    isPaused.value = false
    uploadFiles()
    return
  }
  isPaused.value = true
}

// 上传文件
async function uploadFiles() {
  const uploadTasks = files.value.map(async (fileObj) => {
    if (fileObj.file.raw) {
      const chunkList = getChunkList(fileObj.file)
      for (let i = fileObj.chunkIndex; i < chunkList.length; i++) {
        if (isPaused.value) {
          fileObj.chunkIndex = i
          break
        }
        const chunk = chunkList[i]
        const hash = await calculateHash(chunk.file)
        const isAlreadyUploaded = await isExisted(hash)
        if (!isAlreadyUploaded && !(await uploadChunk(chunk, hash))) {
          alert("文件上传失败")
          return
        }
        // 限制进度显示小数点后两位
        fileObj.progress = parseFloat((((i + 1) / chunkList.length) * 100).toFixed(2))
        updateTotalProgress()
      }
      
      await chunkMerge(fileObj.hash, fileObj.file.name)

    } else {
      throw new Error("File raw error when upload")
    }
  })

  await Promise.all(uploadTasks)
  updateTotalProgress()
}

// 更新总进度
const updateTotalProgress = () => {
  totalProgress.value = parseFloat(
    (files.value.reduce((acc, file) => acc + file.progress, 0) / files.value.length).toFixed(2)
  )
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
