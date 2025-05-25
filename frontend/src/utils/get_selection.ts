import type { FileInfo } from "../model"
import { useAllDataStore } from "../stores"

export function getSelections(
  selection: FileInfo[],
  store = useAllDataStore()
) {
  store.selectFiles = selection
  if (selection.length !== 0) {
    store.renamePreviewButton = false
    store.hiddenDeleteButton = false
  } else {
    store.renamePreviewButton = true
    store.hiddenDeleteButton = true
  }
  if (selection.length === 1) {
    store.hiddenRenameButton = false
  } else {
    store.hiddenRenameButton = true
  }
}
