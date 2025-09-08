import { create } from "zustand"

interface SavedPath {
  savedPath: string
  setSavedPath: (path: string) => void
}

export const useSavedPath = create<SavedPath>((set) => ({
  savedPath: "",
  setSavedPath: (path: string) => set({ savedPath: path })
}))
