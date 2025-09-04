import { create } from "zustand"
import type { FileInfo } from "../models"

interface Store {
  fileList: FileInfo[]
  setFileList: (fileList: FileInfo[]) => void
}

export const useFileListStore = create<Store>()((set) => ({
  fileList: [],
  setFileList: (fileList: FileInfo[]) => set({ fileList })
}))
