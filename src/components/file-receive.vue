<template>
  <el-upload class="file-receive" action="" drag multiple @change="handleChange">
    <!-- <el-icon class="el-icon--upload"><upload-filled /></el-icon> -->
    <div class="el-upload__text">点击选择或拖入文件进行上传</div>
    <template #tip>
      <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { type UploadFile } from 'element-plus'
import { defineProps, defineEmits, ref } from 'vue'
const feature = ref<UploadFile | null>(null);
const emit = defineEmits(['handleAdd'])
const handleChange = (f : UploadFile) => {
  const file = f;
  // emit("getFile", file);
}
</script>
<style lang="less" scoped></style>
