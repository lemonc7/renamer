import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { FileInfo } from "../model"

export const useSelectionStore = defineStore("selection", () => {
  // 选中的文件ID
  const selectedIDs = ref<Set<string>>(new Set())

  // 通过外部传入
  const files = ref<FileInfo[]>([])

  // 操作菜单选择的文件
  const selectedFile = ref<FileInfo | null>(null)

  // 派生计算选中的item名称和文件夹名称
  const selectedNames = computed(() =>
    files.value
      .filter((file) => selectedIDs.value.has(file.id))
      .map((f) => f.name)
  )
  const selectedDirs = computed(() =>
    files.value
      .filter((file) => file.isDir && selectedIDs.value.has(file.id))
      .map((f) => f.name)
  )

  // 同步文件信息
  function setFiles(newFiles: FileInfo[]) {
    files.value = newFiles
  }

  // 设置选中的文件 ID
  function setSelection(selection: Record<string, boolean>) {
    selectedIDs.value = new Set(
      Object.keys(selection).filter((id) => selection[id])
    )
  }

  function clearSelection() {
    selectedIDs.value.clear()
  }

  return {
    selectedIDs,
    selectedFile,
    selectedNames,
    selectedDirs,
    setFiles,
    setSelection,
    clearSelection
  }
})
