import { useMutation, useQuery, useQueryCache } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { copyItems, createDir, deleteItems, getFiles, moveItems } from "../api"
import type { CopyRequest, DeleteRequest, MoveRequest } from "../model"
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
    mutation: (path: string) => createDir(path),
    onSuccess: () => fileQuery.refetch()
  })

  // 删除文件
  const deleteMutation = useMutation({
    mutation: (req: DeleteRequest) => deleteItems(req),
    onSettled: () => fileQuery.refetch()
  })

  const queryCache = useQueryCache()

  // 复制文件
  const copyMutation = useMutation({
    mutation: (req: CopyRequest) => copyItems(req),
    onSettled: () => queryCache.invalidateQueries()
  })
  // 移动文件
  const moveMutation = useMutation({
    mutation: (req: MoveRequest) => moveItems(req),
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

    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isCoping: copyMutation.isLoading,
    isMoving: moveMutation.isLoading
  }
}
