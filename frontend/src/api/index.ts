import type {
  CopyRequest,
  DeleteRequest,
  FileInfo,
  RemoveStringsRequest,
  RenameConfirmRequest,
  RenamePreviewRequest,
  ReplaceChinesePreview
} from "../model"
import service from "./request"

export async function getFiles(path: string): Promise<FileInfo[]> {
  const rawPath = decodeURIComponent(path)
  const res = await service.get<FileInfo[]>("", {
    params: { path: rawPath }
  })
  return Array.isArray(res) ? res : []
}

export async function createDir(path: string) {
  return service.post("", { params: { path } })
}

export async function deleteFiles(req: DeleteRequest) {
  return service.delete("", { params: req })
}

export async function copyFiles(req: CopyRequest) {
  return service.post("/copy", { params: req })
}

export async function moveFiles(req: CopyRequest) {
  return service.post("/move", { params: req })
}

export async function renamePreview(req: RenamePreviewRequest) {
  return service.post("/preview", { params: req })
}

export async function removeTextsPreview(req: RemoveStringsRequest) {
  return service.post("/remove", { params: req })
}

export async function replaceChinesePreview(req: ReplaceChinesePreview) {
  return service.post("/replace", { params: req })
}

export async function renameConfirm(req: RenameConfirmRequest) {
  return service.post("/rename", { params: req })
}
