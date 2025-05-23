import { defineStore } from "pinia"
import { ref } from "vue"

export const useAllDataStore = defineStore("allData", () => {
  const isCollapse = ref(false)

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


  const fileList = ref([
    {
      name: "file.txt",
      type: "txt",
      size: "100KB",
      isDir: false,
      modTime: ""
    },
  ])

  const nameMaps = ref()

  const homePath = "/vol1/1000/tools/project/go/renamer"

  return {
    isCollapse,
    modeOption,
    modeSection,
    fileList,
    homePath,
    nameMaps
  }
})
