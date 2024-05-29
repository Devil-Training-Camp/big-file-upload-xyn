<template>
  <div class="submit" @click="handleClick()">
    <el-button type="success" round>{{ toggleUploadText }}</el-button>
    <span class="uploadText">{{ toggleUploadedText }}</span>
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

const toggleUploadText = computed(() => {
  if(isPause.value && props.uploadProgress < 100){
    return '暂停'
  }
  if (props.uploadProgress == 100) {
    return '上传完成'
  }
  return  '上传'
})

const toggleUploadedText = computed(() => {
  if (props.uploadProgress > 0 && props.uploadProgress < 100) {
    return '上传中...'
  }
  if (props.uploadProgress == 100) {
    return '上传完成'
  }
})

function handleClick() {
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
