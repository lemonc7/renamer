import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { FileInfo } from "../model"

export const useSelectionStore = defineStore("selection", () => {
  // 选中的文件名称
  const selectedNames = ref<Set<string>>(new Set())

  // 通过外部传入
  const files = ref<FileInfo[]>([])

  // 操作菜单选择的文件
  const selectedFile = ref<FileInfo | null>(null)

  // 派生计算选中的文件夹名称
  const selectedDirs = computed(() =>
    files.value
      .filter((file) => file.isDir && selectedNames.value.has(file.name))
      .map((f) => f.name)
  )

  // 同步文件信息
  function setFiles(newFiles: FileInfo[]) {
    files.value = newFiles
  }

  // 设置选中的文件名称
  function setSelection(selection: Record<string, boolean>) {
    selectedNames.value = new Set(
      Object.keys(selection).filter((name) => selection[name])
    )
  }

  function clearSelection() {
    selectedNames.value.clear()
  }

  return {
    selectedFile,
    selectedNames,
    selectedDirs,
    setFiles,
    setSelection,
    clearSelection
  }
})
