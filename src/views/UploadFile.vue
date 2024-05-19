<template>
  <main>
    <FileReceive @file="handleFile" />
    <FileOperate />
  </main>
</template>

<script setup lang="ts">
import FileReceive from '../components/file-receive.vue'
import FileOperate from '../components/file-operate.vue'
import { defineProps } from 'vue'

// 定义组件的 props，接收子组件传递的文件数据
const props = defineProps<{
  file: File | null
}>()

// 在这里处理接收到的文件数据
const handleFile = (file: File) => {
  console.log('Received file:', file)
}
</script>

<style lang="less" scoped></style>
