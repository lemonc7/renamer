import request from "./request"
import { type AxiosResponse } from "axios"
import { useAllDataStore } from "../stores"

const store = useAllDataStore()

interface FileInfo {
  name: string
  size: string
  isDir: boolean
  modTime: string
}

interface NameMaps {
  oldName: string
  newName: string
}

// 获取文件目录
export function getFile(path: string) {
  return async () => {
    let res: AxiosResponse<FileInfo[]> = await request({
      url: "/api/files",
      method: "get",
      params: { path }
    })

    store.fileList = res.data
  }
}

// 创建文件夹
export function createDir(path: string) {
  return async () => {
    await request({
      url: "/api/files",
      method: "post",
      data: { path }
    })
  }
}

// 删除文件夹
export function deleteFile(path: string) {
  return async () => {
    await request({
      url: "/api/files",
      method: "delete",
      data: { path }
    })
  }
}

// 复制文件
export function copyFile(path: string, targetPath: string) {
  return async () => {
    await request({
      url: "/api/files/copy",
      method: "post",
      data: {
        path,
        targetPath
      }
    })
  }
}

// 移动文件
export function moveFile(path: string, targetPath: string) {
  return async () => {
    await request({
      url: "/api/files/move",
      method: "post",
      data: {
        path,
        targetPath
      }
    })
  }
}

// 预览重命名结果
export function renamePreview(
  path: string,
  season: string,
  autoRename: boolean
) {
  return async () => {
    let res: AxiosResponse<NameMaps[]> = await request({
      url: "/api/files/preview",
      method: "post",
      data: {
        path,
        season,
        autoRename
      }
    })
    store.nameMaps = res.data
  }
}

// 确认需要重命名的文件
export function renameFiles(path: string, nameMaps: NameMaps[]) {
  return async () => {
    await request({
      url: "/api/files/rename",
      method: "post",
      data: {
        path,
        nameMaps
      }
    })
  }
}
