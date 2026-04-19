import { defineStore } from "pinia"
import { ref } from "vue"

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
  const operation = ref<{
    open: boolean
    type: "重命名剧集" | "整理剧集" | "替换中文" | "移除字符"
  }>({
    open: false,
    type: "重命名剧集"
  })

  return {
    deleteOpen,
    createOpen,
    renameOpen,
    copyOrMove,
    operation
  }
})
