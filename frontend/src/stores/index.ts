import { defineStore } from "pinia"
import { ref } from "vue"
import type { FileInfo, NameMaps } from "../model"

export const useAllDataStore = defineStore("allData", () => {
  // 选择模式
  const modeOption = [

    {
      value: 1,
      label: "重命名预览"
    },
    {
      value: 2,
      label: "自动重命名"
    },
    {
      value: 3,
      label: "移除指定文本"
    },
    {
      value: 4,
      label: "替换中文字符"
    }
  ]
  const modeSection = ref(1)

  // 目录下的文件信息
  const fileList = ref<FileInfo[]>([])

  // 选择的文件列表
  const selectFiles = ref<FileInfo[]>([])
  
  // 控制button的显示(选择需要重命名的文件夹)
  const renamePreviewButton = ref(true)

  // 预览重命名时选择需要的重命名的文件
  const nameMaps = ref<NameMaps>()

  // 控制粘贴button的显示
  const showPasteButton = ref({
    type: "",
    show: false
  })

  const deleteDialog = ref(false) //delete弹窗
  const hiddenDeleteButton = ref(true)  //delete按钮禁用

  const createDialog = ref(false) //新建目录弹窗
  const inputDirName = ref("")  //新建目录的输入框

  const hiddenRenameButton = ref(true)  //手动重命名按钮禁用
  const renameDialog = ref(false) //手动重命名弹窗
  const newNameManual = ref("") //手动重命名 名称
  
  return {
    modeOption,
    modeSection,
    fileList,
    nameMaps,
    selectFiles,
    renamePreviewButton,
    showPasteButton,
    deleteDialog,
    createDialog,
    hiddenDeleteButton,
    inputDirName,
    hiddenRenameButton,
    renameDialog,
    newNameManual
  }
})
