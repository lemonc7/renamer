import request from "./request"
import { type AxiosResponse } from "axios"
import { useAllDataStore } from "../stores"
import type { FileInfo, NameMap } from "../model"

// 获取文件目录
export async function getFile(path: string, store = useAllDataStore()) {
  try {
    let res: AxiosResponse<FileInfo[]> = await request({
      url: "/api/files",
      method: "get",
      params: { path }
    })
    // 如果后端返回的数据是空的，说明目录下无文件，将fileList设置为空
    store.fileList = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    throw error
  }
}

// 创建文件夹
export async function createDir(path: string) {
  try {
    await request({
      url: "/api/files",
      method: "post",
      data: { path }
    })
  } catch (error) {
    throw error
  }
}

// 删除文件/目录
export async function deleteFile(path: string, store = useAllDataStore()) {
  let nameMaps: NameMap[] = store.selectFiles.map((item) => ({
    dirName: item.name
  }))
  try {
    await request({
      url: "/api/files",
      method: "delete",
      data: {
        path,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

// 复制文件
export async function copyFile(targetPath: string, store = useAllDataStore()) {
  let nameMaps: NameMap[] = store.loadFilesName.map((item) => ({
    dirName: item
  }))
  try {
    await request({
      url: "/api/files/copy",
      method: "post",
      data: {
        path: store.originalPath,
        targetPath,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

// 移动文件
export async function moveFile(targetPath: string, store = useAllDataStore()) {
  let nameMaps: NameMap[] = store.loadFilesName.map((item) => ({
    dirName: item
  }))

  try {
    await request({
      url: "/api/files/move",
      method: "post",
      data: {
        path: store.originalPath,
        targetPath,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

// 预览重命名结果
export async function renamePreview(path: string, store = useAllDataStore()) {
  let nameMaps: NameMap[] = store.selectFiles
    .filter((row) => row.isDir)
    .map((row) => ({
      dirName: row.name
    }))
  try {
    let res: AxiosResponse<NameMap[]> = await request({
      url: "/api/files/preview",
      method: "post",
      data: {
        path,
        nameMaps
      }
    })
    store.nameMaps = res.data
  } catch (error) {
    throw error
  }
}

// 预览替换中文的结果
export async function replaceChinesePreview(
  path: string,
  store = useAllDataStore()
) {
  let nameMaps: NameMap[] = store.selectFiles
    .filter((row) => row.isDir)
    .map((row) => ({
      dirName: row.name
    }))
  try {
    let res: AxiosResponse<NameMap[]> = await request({
      url: "/api/files/replaceChinese",
      method: "post",
      data: {
        path,
        nameMaps
      }
    })
    store.nameMaps = res.data
  } catch (error) {
    throw error
  }
}

// 预览移除文本的效果
export async function removeTextsPreview(
  path: string,
  removedTexts: string[],
  store = useAllDataStore()
) {
  let nameMaps: NameMap[] = store.selectFiles
    .filter((row) => row.isDir)
    .map((row) => ({
      dirName: row.name
    }))
  try {
    let res: AxiosResponse<NameMap[]> = await request({
      url: "/api/files/removeTexts",
      method: "post",
      data: {
        path,
        removedTexts,
        nameMaps
      }
    })
    store.nameMaps = res.data
  } catch (error) {
    throw error
  }
}

// 文件/目录重命名
export async function renameFiles(path: string, nameMaps: NameMap[]) {
  try {
    await request({
      url: "/api/files/rename",
      method: "post",
      data: {
        path,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

export async function tidyAndRenamePreview(
  path: string,
  store = useAllDataStore()
) {
  let renameMaps: NameMap[] = []
  let moveMaps: NameMap[] = []
  store.selectFiles
    .filter((item) => item.isDir && item.season)
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
  let targetPath = path + "/" + store.series
  try {
    // 先整理命名季数
    await renameFiles(path, renameMaps)
    // 创建剧集文件夹
    await createDir(targetPath)
    // 将季文件夹移动到剧集文件夹
    await request({
      url: "/api/files/move",
      method: "post",
      data: {
        path,
        targetPath,
        nameMaps: moveMaps
      }
    })
    // 预览整理后的重命名结果
    let res: AxiosResponse<NameMap[]> = await request({
      url: "/api/files/preview",
      method: "post",
      data: {
        path: targetPath,
        nameMaps: moveMaps
      }
    })
    store.nameMaps = res.data
  } catch (error) {
    throw error
  }
}
