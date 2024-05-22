<template>
  <div class="submit" @click="handleClick()">
    <el-button type="success" round>{{ toggleUploadText }}</el-button>
    <span class="uploadText">{{ toggleUploadedText }}</span>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'

const isUpload = ref<boolean>(true)
const emit = defineEmits<{ (e: 'upload', value: boolean): void }>()

const uploaded = defineProps({
  isUploaded: {
    type: Boolean,
    default: false
  }
})
// TODO 从父获取文件进度

// 根据上传进度更改文字 上传 或 继续，暂停不变
const toggleUploadText = computed(() => {
  return isUpload ? '上传' : '暂停'
})

// 如果进度不为0，则开始显示文字，根据文件上传结束节点调换显示文字
const toggleUploadedText = computed(() => {
  return uploaded ? '上传中...' : '上传完成'
})

function handleClick() {
  emit('upload', isUpload.value)
  isUpload.value = !isUpload.value
}
</script>

<style lang="less" scoped>
.submit {
  margin-top: 20px;
}
.uploadText {
  margin-left: 10px;
  font-size: 13px;
}
</style>
