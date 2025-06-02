import { defineStore } from "pinia"
import { ref } from "vue"
import type { FileInfo, NameMap } from "../model"

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
      label: "替换中文"
    },
    {
      value: 4,
      label: "重命名+整理"
    }
  ]
  const modeSection = ref(1)

  // 目录下的文件信息
  const fileList = ref<FileInfo[]>([])

  // 选择的文件列表
  const selectFiles = ref<FileInfo[]>([])

  // 预览重命名时选择需要的重命名的文件
  const nameMaps = ref<NameMap[]>([])

  // 控制粘贴button的显示
  const showPasteButton = ref({
    type: "",
    show: false
  })
  //删除/复制/粘贴按钮禁用
  const hiddenFilesHandlingButton = ref(true)
  //手动重命名按钮禁用
  const hiddenRenameButton = ref(true)

  // 模式选择-确认-弹窗按钮
  const hiddenModeButton = ref(true)
  const modePreviewDialog = ref(false)

  // 保存准备复制/移动的文件名
  const loadFilesName = ref<string[]>([])
  const originalPath = ref("")

  // ElMessage弹窗时间
  const elmsgShowTime = 3000

  // 整理剧集时输入的剧集名
  const series = ref("")

  // 重命名整理的弹窗
  const showTidySeriesDialog = ref(false)

  return {
    modeOption,
    modeSection,
    fileList,
    nameMaps,
    selectFiles,
    showPasteButton,
    hiddenFilesHandlingButton,
    hiddenRenameButton,
    modePreviewDialog,
    hiddenModeButton,
    loadFilesName,
    originalPath,
    elmsgShowTime,
    series,
    showTidySeriesDialog
  }
})
