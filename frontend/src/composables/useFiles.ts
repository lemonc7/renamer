import { useMutation, useQuery } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { createDir, getFiles } from "../api"

export function useFiles() {
  const route = useRoute()
  const path = computed(() => {
    const path = route.path
    // 如果是空字符串或只有根路径 `/`，返回 `.`
    if (!path || path === "/") {
      return "."
    }
    // 去掉开头的一个或多个 `/`
    return path.replace(/^\/+/, "")
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

  return {
    files: fileQuery.data,
    isLoading: fileQuery.isLoading,
    error: fileQuery.error,
    refetch: fileQuery.refetch,

    createDir: createMutation.mutateAsync,

    isCreating: createMutation.isLoading
  }
}
