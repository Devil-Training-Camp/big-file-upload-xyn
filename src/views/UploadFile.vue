<template>
  <main>
    <!-- 这个 dom 结构清晰了很多 -->
     <!--TODO 多文件上传  但是看起来还不支持多文件上传？ -->
    <FileReceive @file="handleFile" />
    <span class="fileInfo">{{ fileName }}</span>
    <el-progress class="progress" :percentage="uploadProgress"></el-progress>
    <FileOperate @isPause="handlePause" :hasFile="hasFile" :uploadProgress="uploadProgress" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import {isExisted, uploadChunk} from '../service/file'
import { calculateHash } from '../utils/calculateHash'
import { getChunkList } from '../utils/getChunkList'

// 定义引用变量
const fileName = ref<string>('')
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
const handlePause = (upload: boolean) => {
  if (upload) {
    isPaused = false
    uploadFile()
    return
  }
  isPaused = true
}

// 上传文件
async function uploadFile() {
  const chunkList = getChunkList(curFile.value)
  for (let i = chunkIndex; i < chunkList.length; i++) {
    if (isPaused) {
      chunkIndex = i
      break
    }
    const chunk = chunkList[i]
    const hash = await calculateHash(chunk.file)
    const isAlreadyUploaded = await isExisted(hash)
    //TODO 串行改并行 这里还是串行上传，应该改成并行，通过并发限制器来控制频率，可以找其他同学了解下具体实现原理。
    if (!isAlreadyUploaded && !(await uploadChunk(chunk, hash))) {
      alert("文件上传失败")
      return;
    }
    // 限制进度显示小数点后两位
    uploadProgress.value = parseFloat((((i + 1) / chunkList.length) * 100).toFixed(2));
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
