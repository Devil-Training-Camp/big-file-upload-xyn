<template>
  <main>
    <FileReceive @file="handleFile" />
    <span>{{ fileName }}</span>
    <FileOperate />
  </main>
</template>

<script setup lang="ts">
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { ref } from 'vue'

const fileName = ref('');

// 在这里处理接收到的文件数据
const handleFile = (file: File) => {
  console.log('Received file:', file)
  fileName.value = file.name
  uploadFille(file)
}

function uploadFille(file : File){
  // 将文件传递到后端处理
  
}
</script>

<style lang="less" scoped></style>
