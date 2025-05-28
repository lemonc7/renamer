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
export async function deleteFile(path: string, files: string[]) {
  let nameMaps: NameMap[] = []
  files.forEach((item) => {
    nameMaps.push({
      dirName: item,
      filesName: []
    })
  })
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
export async function copyFile(
  path: string,
  targetPath: string,
  files: string[]
) {
  let nameMaps: NameMap[] = []
  files.forEach((item) => {
    nameMaps.push({
      dirName: item,
      filesName: []
    })
  })

  try {
    await request({
      url: "/api/files/copy",
      method: "post",
      data: {
        path,
        targetPath,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

// 移动文件
export async function moveFile(
  path: string,
  targetPath: string,
  files: string[]
) {
  let nameMaps: NameMap[] = []
  files.forEach((item) => {
    nameMaps.push({
      dirName: item,
      filesName: []
    })
  })
  
  try {
    await request({
      url: "/api/files/move",
      method: "post",
      data: {
        path,
        targetPath,
        nameMaps
      }
    })
  } catch (error) {
    throw error
  }
}

// 预览重命名结果
export async function renamePreview(
  path: string,
  dirs: string[],
  store = useAllDataStore()
) {
  let nameMaps: NameMap[] = []
  dirs.forEach((key) => {
    nameMaps.push({
      dirName: key,
      filesName: []
    })
  })

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
