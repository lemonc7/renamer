import { create } from "zustand"
import type { FileInfo } from "../models"

interface Store {
  fileList: FileInfo[]
  fileMap: Map<string, FileInfo>
  setFileList: (fileList: FileInfo[]) => void
  getFileById: (id: string) => FileInfo | undefined
}

export const useFileListStore = create<Store>()((set, get) => ({
  fileList: [],
  fileMap: new Map<string, FileInfo>(),
  setFileList: (files: FileInfo[]) => {
    set({
      fileList: files,
      fileMap: new Map(files.map((f) => [f.id, f]))
    })
  },
  getFileById: (id: string) => get().fileMap.get(id)
}))
