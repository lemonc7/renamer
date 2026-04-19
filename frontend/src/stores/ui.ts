import { defineStore } from "pinia"
import { ref } from "vue"

export const useUiStore = defineStore("ui", () => {
  const deleteOpen = ref(false)
  const createOpen = ref(false)
  const renameOpen = ref(false)
  const operation = ref<{
    open: boolean
    type: "移动" | "复制"
  }>({
    open: false,
    type: "移动"
  })

  return {
    deleteOpen,
    createOpen,
    renameOpen,
    operation
  }
})
