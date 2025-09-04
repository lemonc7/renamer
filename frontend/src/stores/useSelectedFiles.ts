import { create } from "zustand"
import type { FileInfo } from "../models"

interface SelectedFilesStore {
  selectedFiles: FileInfo[]
  toggleFile: (file: FileInfo) => void
  clearAll: () => void
  selectAll: (files: FileInfo[]) => void
}

export const useSelectedFilesStore = create<SelectedFilesStore>((set) => ({
  selectedFiles: [],
  toggleFile: (file: FileInfo) =>
    set((state) => {
      const exists = state.selectedFiles.some((f) => f.id === file.id)
      return exists
        ? { selectedFiles: state.selectedFiles.filter((f) => f.id !== file.id) }
        : { selectedFiles: [...state.selectedFiles, file] }
    }),
  clearAll: () => set({ selectedFiles: [] }),
  selectAll: (files: FileInfo[]) => set({ selectedFiles: files })
}))
