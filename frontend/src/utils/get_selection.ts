import type { FileInfo } from "../model"
import { useAllDataStore } from "../stores"


export function getSelections(selection: FileInfo[]) {
  let store = useAllDataStore()
  store.selectFiles = selection
  if (selection.length !== 0) {
    store.renamePreviewButton = false
  } else {
    store.renamePreviewButton = true
  }
}

export function confirmRename(path: string) {
  let store = useAllDataStore()
  let names = store.selectFiles.map((row) => row.name)
  names.forEach((name: string) => {
    console.log(path + "/" + name)
  })
}
