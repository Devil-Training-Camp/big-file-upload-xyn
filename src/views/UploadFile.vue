<template>
  <main>
    <FileReceive @file="handleFile" />
    <span>{{ fileName }}</span>
    <FileOperate @upload="handleClick" :isUploaded="isUploaded" />
  </main>
</template>

<script setup lang="ts">
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

const progress = ref<Number>();
const fileName = ref<String>('')
const isUploaded = ref<boolean>(false)
const chunkSize = 1024 * 1024 * 1
let curFile = ref<UploadFile>()

interface IFileChunk {
  file: Blob;
  chunkIndex: number;
  uploaded: boolean;
}

// 接收文件
const handleFile = (f: UploadFile) => {
  curFile.value = f
  fileName.value = f.name
}

// 点击上传时开始上传文件
const handleClick = (upload: boolean) => {
  if (upload) {
    uploadFile()
  }
}

function uploadFile() {
  if (!curFile.value) {
    // ElMessage.error('请点击选择或拖入需要上传的文件')
    alert('请点击选择或拖入需要上传的文件')
    return
  }
  // 文件分片
  const chunkList = getChunkList()
  // TODO 计算每一个分片的计算hash值用于判断是否进行上传
  // 获取每一个文件上传分频 判断是否已经上传过，没上传的上传，之后更新进度
  chunkList.forEach((chunk)=>{
    const hash = calculateHash(chunk.file);
    const isAlreadyUploaded = isExisted(hash); // 检查哈希是否已经存在于服务器中
    if (!isAlreadyUploaded) {
      // 上传文件分片
      uploadChunk(chunk);
    }
  })
  // TODO 上传文件
  // 如何算上传成功？ 保存文件到本地？ 分片进行保存


  // 文件上传成功 传递结束标志，更新进度
  isUploaded.value = true;
}

// 判断是否已经上传过
function isExisted(hash: string): boolean{
  return true;
}

// 计算hash值
function calculateHash(file : Blob) : string{
  return 'hashValue'
}

// 文件分片
function getChunkList() : IFileChunk[]{
  let chunkList : IFileChunk[] = [];
  let start = 0;
  let index = 0;
  if (curFile.value?.raw == undefined || curFile.value?.size == undefined) {
    return [];
  }

  while(start <= curFile.value.raw.size) {
    let curChunk = curFile.value.raw.slice(start, start + chunkSize)
    chunkList.push({
      file: curChunk,
      chunkIndex: index,
      uploaded: false
    })
    index++;
    start += chunkSize
  }
  return chunkList
}

// 上传分片到服务器
function uploadChunk(chunk : IFileChunk):boolean{
  return true
}
</script>

<style lang="less" scoped></style>
