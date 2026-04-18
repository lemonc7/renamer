import type {
  CopyRequest,
  DeleteRequest,
  FileInfo,
  MoveRequest,
  Node,
  RemoveStringsRequest,
  RenameConfirmRequest,
  RenamePreviewRequest,
  ReplaceChinesePreview
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

export async function copyItems(req: CopyRequest) {
  return service.post("/copy", req)
}

export async function moveItems(req: MoveRequest) {
  return service.post("/move", req)
}

export async function renamePreview(req: RenamePreviewRequest) {
  return service.post("/preview", req)
}

export async function removeStringsPreview(req: RemoveStringsRequest) {
  return service.post("/remove", req)
}

export async function replaceChinesePreview(req: ReplaceChinesePreview) {
  return service.post("/replace", req)
}

export async function renameConfirm(req: RenameConfirmRequest) {
  return service.post("/rename", req)
}
