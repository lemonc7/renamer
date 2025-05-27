import type { FileInfo } from "../model"
import { useAllDataStore } from "../stores"

export function getSelections(
  selection: FileInfo[],
  store = useAllDataStore()
) {
  store.selectFiles = selection
  if (selection.length !== 0) {
    store.hiddenDeleteButton = false
  } else {
    store.hiddenDeleteButton = true
  }

  let dirsNumber = 0
  selection.forEach((item) => {
    if (item.isDir) {
      dirsNumber++
    }
  })
  if (dirsNumber > 0) {
    store.hiddenModeButton = false
  } else {
    store.hiddenModeButton = true
  }

  if (selection.length === 1) {
    store.hiddenRenameButton = false
  } else {
    store.hiddenRenameButton = true
  }
}
