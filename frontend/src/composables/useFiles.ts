import { useMutation, useQuery, useQueryCache } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import {
  copyItems,
  createDir,
  deleteItems,
  getFiles,
  moveItems,
  renameItem
} from "../api"
import type {
  CopyRequest,
  DeleteRequest,
  MoveRequest,
  RenameRequest
} from "../model"
import { getCleanPath } from "../utils/path"

export function useFiles() {
  const route = useRoute()
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
  const fileQuery = useQuery({
    key: () => ["files", path.value],
    query: () => getFiles(path.value),
    enabled: computed(() => !!path.value)
  })

  // 创建文件夹
  const createMutation = useMutation({
    mutation: (name: string) => createDir(`${path.value}/${name}`),
    onSuccess: () => fileQuery.refetch()
  })

  // 删除文件
  const deleteMutation = useMutation({
    mutation: (req: Omit<DeleteRequest, "dir">) =>
      deleteItems({
        dir: path.value,
        ...req
      }),
    onSettled: () => fileQuery.refetch()
  })

  const queryCache = useQueryCache()

  // 复制文件
  const copyMutation = useMutation({
    mutation: (req: Omit<CopyRequest, "dir">) =>
      copyItems({
        dir: path.value,
        ...req
      }),
    // 成功和失败都刷新数据，因为失败也可能有脏数据(部分成功)
    onSettled: () => queryCache.invalidateQueries()
  })
  // 移动文件
  const moveMutation = useMutation({
    mutation: (req: Omit<MoveRequest, "dir">) =>
      moveItems({
        dir: path.value,
        ...req
      }),
    onSettled: () => queryCache.invalidateQueries()
  })

  // 重命名文件
  const renameMutation = useMutation({
    mutation: (req: Omit<RenameRequest, "dir">) =>
      renameItem({
        dir: path.value,
        ...req
      }),
    onSuccess: () => fileQuery.refetch()
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

    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isCoping: copyMutation.isLoading,
    isMoving: moveMutation.isLoading,
    isRenaming: renameMutation.isLoading
  }
}
