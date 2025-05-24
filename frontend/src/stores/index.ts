import { defineStore } from "pinia"
import { ref } from "vue"
import type { FileInfo,NameMap } from "../model"

export const useAllDataStore = defineStore("allData", () => {
  // 选择模式
  const modeOption = [
    {
      value: 1,
      label: "重命名"
    },
    {
      value: 2,
      label: "替换中文"
    },
    {
      value: 3,
      label: "移除指定文本"
    }
  ]
  const modeSection = ref()

  // 目录下的文件信息
  const fileList = ref<FileInfo[]>([])

  // 选择的文件列表
  const selectFiles = ref<FileInfo[]>([])
  // 控制button的显示(选择需要重命名的文件夹)
  const renamePreviewButton = ref(true)

  // 预览重命名时选择需要的重命名的文件
  const nameMaps = ref<NameMap[]>([])

  // 控制粘贴button的显示
  const showPasteButton = ref({
    type: "",
    show: false
  }) 

  return {
    modeOption,
    modeSection,
    fileList,
    nameMaps,
    selectFiles,
    renamePreviewButton,
    showPasteButton
  }
})
