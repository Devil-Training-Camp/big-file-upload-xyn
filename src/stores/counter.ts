import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 这个 store 看起来也并没有被用到
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
