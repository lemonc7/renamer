import type { AxiosResponse } from "axios"
import type { FileInfo, NameMap } from "../models"
import request from "./request"
import { useFileListStore } from "../stores/useFileList"
import { useSelectedFilesStore } from "../stores/useSelectedFiles"
import { useSavedFilesStore } from "../stores/useSavedFiles"
import { useSavedPath } from "../stores/useSavedPath"
import { usePreviewRename } from "../stores/usePreviewRename"
import { useSavedSeries } from "../stores/useSavedSeries"

// 获取文件目录
export async function getFiles(path: string) {
  const res: AxiosResponse<FileInfo[]> = await request({
    url: "/api/files",
    method: "get",
    params: { path }
  })

  const fileList = Array.isArray(res.data) ? res.data : []
  useFileListStore.getState().setFileList(fileList)
}

// 创建文件夹
export async function createDir(path: string) {
  await request({
    url: "/api/files",
    method: "post",
    data: { path }
  })
}

// 删除文件
export async function deleteFiles(path: string) {
  const nameMaps: NameMap[] = useSelectedFilesStore
    .getState()
    .selectedFiles.map((item) => ({
      dirName: item.name
    }))
  await request({
    url: "/api/files",
    method: "delete",
    data: {
      path,
      nameMaps
    }
  })
}

// 复制文件
export async function copyFiles(targetPath: string) {
  const nameMaps: NameMap[] = useSavedFilesStore
    .getState()
    .savedFiles.map((item) => ({
      dirName: item
    }))
  await request({
    url: "/api/files/copy",
    method: "post",
    data: {
      path: useSavedPath.getState().path,
      targetPath,
      nameMaps
    }
  })
}

// 移动文件
export async function moveFiles(targetPath: string) {
  const nameMaps: NameMap[] = useSavedFilesStore
    .getState()
    .savedFiles.map((item) => ({
      dirName: item
    }))
  await request({
    url: "/api/files/move",
    method: "post",
    data: {
      path: useSavedPath.getState().path,
      targetPath,
      nameMaps
    }
  })
}

// 预览重命名
export async function renamePreview(path: string) {
  const nameMaps: NameMap[] = useSelectedFilesStore
    .getState()
    .selectedFiles.filter((item) => item.isDir)
    .map((item) => ({
      dirName: item.name
    }))
  const res: AxiosResponse<NameMap[]> = await request({
    url: "/api/files/preview",
    method: "post",
    data: {
      path,
      nameMaps
    }
  })
  usePreviewRename.getState().setNameMaps(res.data)
}

// 将中文替换为拼音并预览
export async function replaceChinesePreview(path: string) {
  const nameMaps: NameMap[] = useSelectedFilesStore
    .getState()
    .selectedFiles.filter((item) => item.isDir)
    .map((item) => ({
      dirName: item.name
    }))

  const res: AxiosResponse<NameMap[]> = await request({
    url: "/api/files/replaceChinese",
    method: "post",
    data: {
      path,
      nameMaps
    }
  })
  usePreviewRename.getState().setNameMaps(res.data)
}

// 移除指定文本并预览
export async function removeTextsPreview(path: string, removedTexts: string[]) {
  const nameMaps: NameMap[] = useSelectedFilesStore
    .getState()
    .selectedFiles.filter((item) => item.isDir)
    .map((item) => ({
      dirName: item.name
    }))

  const res: AxiosResponse = await request({
    url: "/api/files/removeTexts",
    method: "post",
    data: {
      path,
      removedTexts,
      nameMaps
    }
  })

  usePreviewRename.getState().setNameMaps(res.data)
}

// 文件重命名
export async function renameFiles(path: string, nameMaps: NameMap[]) {
  await request({
    url: "/api/files/rename",
    method: "post",
    data: {
      path,
      nameMaps
    }
  })
}

// 整理剧集
export async function tidySeries(path: string) {
  const renameMaps: NameMap[] = []
  const moveMaps: NameMap[] = []
  useSelectedFilesStore
    .getState()
    .selectedFiles.filter((item) => item.isDir && item.season)
    .forEach((item) => {
      renameMaps.push({
        dirName: "",
        filesName: [
          {
            oldName: item.name,
            newName: item.season!
          }
        ]
      })

      moveMaps.push({
        dirName: item.season!
      })
    })

  await renameFiles(path, renameMaps)
  const series = useSavedSeries.getState().savedSeries
  if (series) {
    const targetPath = path + "/" + series

    await createDir(targetPath)
    await request({
      url: "/api/files/move",
      method: "post",
      data: {
        path,
        targetPath,
        nameMaps: moveMaps
      }
    })
  }
}
