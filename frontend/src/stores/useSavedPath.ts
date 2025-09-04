import { create } from "zustand"

interface SavedPath {
  path: string
  setPath: (path: string) => void
}

export const useSavedPath = create<SavedPath>((set) => ({
  path: "",
  setPath: (path: string) => set({ path })
}))