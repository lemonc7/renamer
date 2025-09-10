import { create } from "zustand"
import type { NameMap } from "../models"

interface PreviewRename {
  nameMaps: NameMap[]
  setNameMaps: (nameMaps: NameMap[] | ((prev: NameMap[]) => NameMap[])) => void
}

export const usePreviewRename = create<PreviewRename>((set) => ({
  nameMaps: [],
  setNameMaps: (nameMaps) =>
    set((state) => ({
      nameMaps:
        typeof nameMaps === "function" ? nameMaps(state.nameMaps) : nameMaps
    }))
}))
