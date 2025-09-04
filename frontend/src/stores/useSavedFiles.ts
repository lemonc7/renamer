import { create } from "zustand"
import type { FileInfo } from "../models"

interface SavedFilesStore {
  savedFiles: string[]
  setSavedFiles: (files: FileInfo[]) => void
}

export const useSavedFilesStore = create<SavedFilesStore>((set) => ({
  savedFiles: [],
  setSavedFiles: (files: FileInfo[]) =>
    set({ savedFiles: files.map((f) => f.name) })
}))
