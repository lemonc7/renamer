export interface FileInfo {
  name: string
  type: string
  size: string
  isDir: boolean
  modTime: string
}

export interface NameMap {
  oldName: string
  newName: string
}
