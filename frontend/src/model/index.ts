interface FileInfo {
  name: string
  type: string
  size: string
  isDir: boolean
  modTime: string
}

interface Names {
  oldName: string
  newName: string
}

// type NameMaps = Record<string,Names[]> 
interface NameMap {
  dirName: string,
  filesName: Names[]
}

export type { FileInfo, Names, NameMap }
