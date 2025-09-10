interface FileInfo {
  id: string
  name: string
  type: string
  size: string
  isDir: boolean
  modTime: string
  season?: string
}

interface Names {
  oldName: string
  newName: string
}

interface NameMap {
  dirName: string
  filesName?: Names[]
}

export const OperationMode = {
  Rename: "剧集重命名",
  TidySeries: "整理剧集",
  ReplaceChinese: "替换中文",
  RemoveTexts: "移除文本"
} as const

export type OperationMode = (typeof OperationMode)[keyof typeof OperationMode]

export type { FileInfo, Names, NameMap, }
