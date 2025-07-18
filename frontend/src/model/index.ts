interface FileInfo {
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
  episodeOffset?: number
  filesName?: Names[]
}

export type { FileInfo, Names, NameMap }
