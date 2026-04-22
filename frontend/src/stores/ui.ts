import { defineStore } from "pinia"
import { ref } from "vue"
import type { OperationType } from "../model"

export const useUiStore = defineStore("ui", () => {
  const deleteOpen = ref(false)
  const createOpen = ref(false)
  const renameOpen = ref(false)
  const copyOrMove = ref<{
    open: boolean
    type: "移动" | "复制"
  }>({
    open: false,
    type: "移动"
  })
  const operationOpen = ref(false)
  const operationType = ref<OperationType>("重命名剧集")
  const removeStrings = ref<string[]>([])
  const removeOpen = ref(false)

  return {
    deleteOpen,
    createOpen,
    renameOpen,
    copyOrMove,
    operationOpen,
    operationType,
    removeStrings,
    removeOpen
  }
})
