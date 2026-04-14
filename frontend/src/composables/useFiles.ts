import { useQuery } from "@pinia/colada"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { getFiles } from "../api"

export function useFiles() {
  const route = useRoute()
  const path = computed(() => {
    const fullPath = route.fullPath
    // 如果是空字符串或只有根路径 `/`，返回 `.`
    if (!fullPath || fullPath === "/") {
      return "."
    }
    // 去掉开头的一个或多个 `/`
    return fullPath.replace(/^\/+/, "")
  })

  const fileQuery = useQuery({
    key: () => ["files", path.value],
    query: () => getFiles(path.value),
    enabled: computed(() => !!path.value)
  })

  return {
    files: fileQuery.data,
    isLoading: fileQuery.isLoading,
    error: fileQuery.error
  }
}
