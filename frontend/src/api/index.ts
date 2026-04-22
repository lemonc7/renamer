import type {
  CopyRequest,
  DeleteRequest,
  FileInfo,
  MoveRequest,
  NameMap,
  Node,
  RemoveStringsRequest,
  RenameConfirmRequest,
  RenamePreviewRequest,
  RenameRequest,
  ReplaceChinesePreview,
  UnifySeriesRequest
} from "../model"
import service from "./request"

export async function getFiles(path: string) {
  const rawPath = decodeURIComponent(path)
  const res = await service.get<FileInfo[]>("", {
    params: { path: rawPath }
  })
  return Array.isArray(res) ? res : []
}

export async function getDirs(path: string) {
  const rawPath = decodeURIComponent(path)
  const res = await service.get<Node[]>("/tree", {
    params: { path: rawPath }
  })
  return Array.isArray(res) ? res : []
}

export async function createDir(path: string) {
  return service.post("", { path })
}

export async function deleteItems(req: DeleteRequest) {
  return service.delete("", { data: req })
}

export async function renameItem(req: RenameRequest) {
  return service.put("", req)
}

export async function copyItems(req: CopyRequest) {
  return service.post("/copy", req)
}

export async function moveItems(req: MoveRequest) {
  return service.post("/move", req)
}

export async function renamePreview(req: RenamePreviewRequest) {
  const res = await service.post<NameMap[]>("/preview", req)
  return Array.isArray(res) ? res : []
}

export async function removeStringsPreview(req: RemoveStringsRequest) {
  const res = await service.post<NameMap[]>("/remove", req)
  return Array.isArray(res) ? res : []
}

export async function replaceChinesePreview(req: ReplaceChinesePreview) {
  const res = await service.post<NameMap[]>("/replace", req)
  return Array.isArray(res) ? res : []
}

export async function renameConfirm(req: RenameConfirmRequest) {
  return service.post("/rename", req)
}

export async function unifySeries(req: UnifySeriesRequest) {
  return service.post("/unify", req)
}
