import { useAllDataStore } from "../stores"

export function editPasteButton(type: string, store = useAllDataStore()) {
  if (type === "") {
    store.showPasteButton.show = false
    store.showPasteButton.type = ""
  } else {
    store.showPasteButton.show = true
    store.showPasteButton.type = type
  }
}
