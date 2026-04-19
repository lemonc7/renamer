// 获取的文件信息
export interface FileInfo {
  id: string
  name: string
  ext: string
  size: string
  isDir: boolean
  modTime: string
}

export interface Node {
  name: string
  path: string
  hasChildren: boolean
}

// 复制请求
export interface CopyRequest {
  dir: string
  targetDir: string
  originals: string[]
}
// 移动请求
export type MoveRequest = CopyRequest

// 删除请求
export interface DeleteRequest {
  dir: string
  targets: string[]
}

// 重命名文件请求
export interface RenameRequest {
  dir: string
  originalName: string
  targetName: string
}

// 重命名预览请求（与 DeleteRequest 相同）
export type RenamePreviewRequest = DeleteRequest

// 替换中文预览请求（与 DeleteRequest 相同）
export type ReplaceChinesePreview = DeleteRequest

// 移除文本请求
export interface RemoveStringsRequest {
  dir: string
  targets: string[]
  strings: string[]
}

// 重命名前后的文件名
export interface Name {
  oldName: string
  newName: string
}

// 文件名映射
export interface NameMap {
  dir: string
  files: Name[]
}

// 重命名确认请求
export interface RenameConfirmRequest {
  dir: string
  nameMaps: NameMap[]
}

export type OperationType = "重命名剧集" | "替换中文" | "移除字符"
