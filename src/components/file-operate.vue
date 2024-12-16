<template>
  <div class="submit" @click="handleClick()">
    <el-button type="success" round>{{ btnOperateText }}</el-button>
    <span class="uploadText">{{ fileUploadStateText }}</span>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'

const isPause = ref<boolean>(false)
const emit = defineEmits<{ (e: 'isPause', value: boolean): void }>()

const props = defineProps<{
  uploadProgress: number
  hasFile: boolean
}>()

// 这里应该是 btnOperateText
const btnOperateText = computed(() => {
  if(isPause.value && props.uploadProgress < 100){
    return '暂停'
  }
  if (props.uploadProgress == 100) {
    return '上传完成'
  }
  return  '上传'
})

// 这里应该是 fileUploadStateText
const fileUploadStateText = computed(() => {
  if (props.uploadProgress > 0 && props.uploadProgress < 100) {
    return '上传中...'
  }
  if (props.uploadProgress == 100) {
    return '上传完成'
  }
})

function handleClick() {
  if (!props.hasFile) {
    alert('请点击选择或拖入需要上传的文件')
    return
  }
  if (props.hasFile && props.uploadProgress < 100) {
    isPause.value = !isPause.value
    emit('isPause', isPause.value)
  }
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
