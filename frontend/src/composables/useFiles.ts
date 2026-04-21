import { useMutation, useQuery, useQueryCache } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import {
  copyItems,
  createDir,
  deleteItems,
  getFiles,
  moveItems,
  renameConfirm,
  renameItem
} from "../api"

import { getCleanPath } from "../utils/path"
import { useSelectionStore } from "../stores/selection"
import type { FileInfo, NameMap } from "../model"

export function useFiles() {
  const route = useRoute()
  const selectionStore = useSelectionStore()

  const path = computed(() => {
    const path = route.path
    // 如果是空字符串或只有根路径 `/`，返回 `.`
    if (!path || path === "/") {
      return "."
    }
    // 去掉开头的一个或多个 `/`
    return getCleanPath(path)
  })

  // 获取文件信息
  const fileQuery = useQuery<FileInfo[]>({
    key: () => [path.value, "files"],
    query: () => getFiles(path.value),
    enabled: computed(() => !!path.value)
  })

  const queryCache = useQueryCache()
  // 创建文件夹
  const createMutation = useMutation({
    mutation: (name: string) => createDir(`${path.value}/${name}`),
    onSuccess: () => fileQuery.refetch()
  })

  // 选择需要删除/复制/移动的文件
  const selectedNames = computed(() =>
    selectionStore.selectedFile
      ? [selectionStore.selectedFile.name]
      : selectionStore.selectedNames
  )
  // 删除文件
  const deleteMutation = useMutation({
    mutation: () =>
      deleteItems({
        dir: path.value,
        targets: selectedNames.value
      }),
    onSettled: () => fileQuery.refetch()
  })

  // 复制文件
  const copyMutation = useMutation({
    mutation: (targetDir: string) =>
      copyItems({
        dir: path.value,
        targetDir,
        originals: selectedNames.value
      }),
    // 成功和失败都刷新数据，因为失败也可能有脏数据(部分成功)
    onSettled: () => queryCache.invalidateQueries()
  })
  // 移动文件
  const moveMutation = useMutation({
    mutation: (targetDir: string) =>
      moveItems({
        dir: path.value,
        targetDir,
        originals: selectedNames.value
      }),
    onSettled: () => queryCache.invalidateQueries()
  })

  // 重命名文件
  const renameMutation = useMutation({
    mutation: (targetName: string) =>
      renameItem({
        dir: path.value,
        originalName: selectionStore.selectedFile
          ? selectionStore.selectedFile.name
          : "",
        targetName
      }),
    onSuccess: () => fileQuery.refetch()
  })

  // 批量重命名
  const renameBatchMutation = useMutation({
    mutation: (nameMaps: NameMap[]) =>
      renameConfirm({
        dir: path.value,
        nameMaps
      }),
    onSettled: () => queryCache.invalidateQueries()
  })

  return {
    files: fileQuery.data,
    isLoading: fileQuery.isLoading,
    error: fileQuery.error,
    refresh: queryCache.invalidateQueries,

    createDir: createMutation.mutateAsync,
    deleteItems: deleteMutation.mutateAsync,
    copyItems: copyMutation.mutateAsync,
    moveItems: moveMutation.mutateAsync,
    renameItem: renameMutation.mutateAsync,
    renameBatch: renameBatchMutation.mutateAsync,

    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isCoping: copyMutation.isLoading,
    isMoving: moveMutation.isLoading,
    isRenaming: renameMutation.isLoading,
    isRenameBatching: renameBatchMutation.isLoading
  }
}
