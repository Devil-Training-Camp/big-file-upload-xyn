<template>
  <el-upload class="file-receive" :auto-upload="false" drag multiple @change="handleChange">
    <!-- <el-icon class="el-icon--upload"><upload-filled /></el-icon> -->
    <div class="el-upload__text">点击选择或拖入文件进行上传</div>
  </el-upload>
</template>

<script setup lang="ts">
import { type UploadFile } from 'element-plus'
import { defineProps, defineEmits, ref } from 'vue'

const emit = defineEmits<{ (e: 'file', value: UploadFile): void }>()
const handleChange = (file: UploadFile) => {
  emit('file', file)
}
</script>
<style lang="less" scoped></style>
