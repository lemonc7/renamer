import type {
  CopyRequest,
  DeleteRequest,
  FileInfo,
  RemoveTextsRequest,
  RenameConfirmRequest,
  RenamePreviewRequest,
  ReplaceChinesePreview,
} from "../model";
import service from "./request";

export async function getFiles(path: string): Promise<FileInfo[]> {
  const res = await service.get<FileInfo[]>("/files", {
    params: { path },
  });
  return Array.isArray(res) ? res : [];
}

export async function createDir(path: string) {
  return service.post("/files", { params: { path } });
}

export async function deleteFiles(req: DeleteRequest) {
  return service.delete("/files", { params: req });
}

export async function copyFiles(req: CopyRequest) {
  return service.post("/files/copy", { params: req });
}

export async function moveFiles(req: CopyRequest) {
  return service.post("/files/move", { params: req });
}

export async function renamePreview(req: RenamePreviewRequest) {
  return service.post("/files/preview", { params: req });
}

export async function removeTextsPreview(req: RemoveTextsRequest) {
  return service.post("/files/removeTexts", { params: req });
}

export async function replaceChinesePreview(req: ReplaceChinesePreview) {
  return service.post("/files/replaceChinese", { params: req });
}

export async function renameConfirm(req: RenameConfirmRequest) {
  return service.post("/files/rename", { params: req });
}
