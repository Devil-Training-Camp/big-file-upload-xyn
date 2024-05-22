<template>
  <main>
    <FileReceive @file="handleFile" />
    <span>{{ fileName }}</span>
    <FileOperate @upload="handleClick" :isUploaded="isUploaded"/>
  </main>
</template>

<script setup lang="ts">
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

const fileName = ref<String>('')
const isUploaded = ref<boolean>(false)
let curFile = ref<UploadFile | null>(null)

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
//TODO  文件进度传递
function uploadFile() {
  if (!curFile.value) {
    // ElMessage.error('请点击选择或拖入需要上传的文件')
    alert('请点击选择或拖入需要上传的文件')
    return
  }
  // TODO 文件分片
  // ？完全分片完成之后再上传还是分一片就传一片
  // 上传文件
  // 如何算上传成功？ 保存文件到本地？ 分片之后保存的样式是一片一个？
  

  // 文件上传成功 传递结束标志
  isUploaded.value = true;
}
</script>

<style lang="less" scoped></style>
