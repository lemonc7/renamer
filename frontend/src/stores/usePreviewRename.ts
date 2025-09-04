import { create } from "zustand"
import type { NameMap } from "../models"

interface PreviewRename {
  nameMaps: NameMap[]
  setNameMaps: (nameMaps: NameMap[]) => void
}

export const usePreviewRename = create<PreviewRename>((set) => ({
  nameMaps: [],
  setNameMaps: (nameMaps: NameMap[]) => set({ nameMaps })
}))
