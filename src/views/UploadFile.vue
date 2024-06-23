<template>
  <main>
    <!-- 这个 dom 结构清晰了很多 -->
     <!-- 但是看起来还不支持多文件上传？ -->
    <FileReceive @file="handleFile" />
    <span class="fileInfo">{{ fileName }}</span>
    <el-progress class="progress" :percentage="uploadProgress"></el-progress>
    <FileOperate @isPause="handleClick" :hasFile="hasFile" :uploadProgress="uploadProgress" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import {isExisted, uploadChunk} from '../service/file'
import type { IFileChunk } from '../types/interface'
import Worker from "../utils/hashWorker.ts?worker";

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
// 这个 click 名字太泛化了，应该取一个别的名字，比如 handlePause
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
  const chunkList = getChunkList()
  for (let i = chunkIndex; i < chunkList.length; i++) {
    if (isPaused) {
      chunkIndex = i
      break
    }
    const chunk = chunkList[i]
    const hash = await calculateHash(chunk.file)
    const isAlreadyUploaded = await isExisted(hash)
    // 这里还是串行上传，应该改成并行，通过并发限制器来控制频率，可以找其他同学了解下具体实现原理。
    if (!isAlreadyUploaded && !(await uploadChunk(chunk, hash))) {
      alert("文件上传失败")
      return;
    }
    // 限制进度显示小数点后两位
    uploadProgress.value = parseFloat((((i + 1) / chunkList.length) * 100).toFixed(2));
  }
}

// 计算文件哈希值
// 这个函数抽出去，完全没必要放在组件里
function calculateHash(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage(file);
    worker.onmessage = (e: MessageEvent) => {
      const { hash, error } = e.data;
      if (hash) {
        resolve(hash);
        worker.terminate();
      } else if (error) {
        reject(new Error(error));
        worker.terminate();
      }
    };
    worker.onerror = (event: ErrorEvent) => {
      worker.terminate();
      reject(event.error);
    };
  });
}

// 获取文件分片列表
// 这个函数也抽出去
function getChunkList(): IFileChunk[] {
  const chunkList: IFileChunk[] = []
  let start = 0
  let index = 0

  if (curFile.value?.raw) {
    const fileSize = curFile.value.raw.size
    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize)
      const chunk = curFile.value.raw.slice(start, end)
      chunkList.push({ file: chunk, chunkIndex: index++, uploaded: false})
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
