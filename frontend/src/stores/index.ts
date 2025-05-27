import { defineStore } from "pinia"
import { ref } from "vue"
import type { FileInfo, NameMaps } from "../model"

export const useAllDataStore = defineStore("allData", () => {
  // 选择模式
  const modeOption = [
    {
      value: 1,
      label: "自动重命名"
    },
    {
      value: 2,
      label: "移除指定文本"
    },
    {
      value: 3,
      label: "替换中文字符"
    }
  ]
  const modeSection = ref(1)

  // 目录下的文件信息
  const fileList = ref<FileInfo[]>([])

  // 选择的文件列表
  const selectFiles = ref<FileInfo[]>([])

  // 预览重命名时选择需要的重命名的文件
  const nameMaps = ref<NameMaps>({})

  // 控制粘贴button的显示
  const showPasteButton = ref({
    type: "",
    show: false
  })
  //delete按钮禁用
  const hiddenDeleteButton = ref(true)
  //手动重命名按钮禁用
  const hiddenRenameButton = ref(true)

  // 模式选择-确认-弹窗按钮
  const hiddenModeButton = ref(true)
  const previewRenameDialog = ref(false)
  
  return {
    modeOption,
    modeSection,
    fileList,
    nameMaps,
    selectFiles,
    showPasteButton,
    hiddenDeleteButton,
    hiddenRenameButton,
    previewRenameDialog,
    hiddenModeButton
  }
})
