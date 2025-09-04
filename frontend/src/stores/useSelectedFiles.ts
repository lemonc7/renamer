import { create } from "zustand"
import type { FileInfo } from "../models"

interface SelectedFilesStore {
  selectedFiles: FileInfo[]
  setSelectedFiles: (files: FileInfo[]) => void
}

export const useSelectedFilesStore = create<SelectedFilesStore>((set) => ({
  selectedFiles: [],
  setSelectedFiles: (files: FileInfo[]) => set({ selectedFiles: files })
}))
