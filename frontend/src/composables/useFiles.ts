import { useMutation, useQuery } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { createDir, deleteItems, getFiles } from "../api"
import type { DeleteRequest } from "../model"
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
    onSuccess: () => fileQuery.refetch()
  })

  return {
    files: fileQuery.data,
    isLoading: fileQuery.isLoading,
    error: fileQuery.error,
    refetch: fileQuery.refetch,

    createDir: createMutation.mutateAsync,
    deleteItems: deleteMutation.mutateAsync,

    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  }
}
