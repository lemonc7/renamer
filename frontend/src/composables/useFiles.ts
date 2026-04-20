import { useMutation, useQuery, useQueryCache } from "@pinia/colada"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import {
  copyItems,
  createDir,
  deleteItems,
  getFiles,
  moveItems,
  removeStringsPreview,
  renameItem,
  renamePreview,
  replaceChinesePreview
} from "../api"

import { getCleanPath } from "../utils/path"
import { useUiStore } from "../stores/ui"
import { useSelectionStore } from "../stores/selection"
import type { FileInfo, NameMap } from "../model"

export function useFiles() {
  const route = useRoute()
  const uiStore = useUiStore()
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

  // 重命名预览
  const renameQuery = useQuery<NameMap[]>({
    key: () => [path.value, "rename", [...selectionStore.selectedDirs].sort()],
    query: () =>
      renamePreview({
        dir: path.value,
        targets: selectionStore.selectedDirs
      }),
    enabled: computed(
      () => uiStore.operationOpen && uiStore.operationType === "重命名剧集"
    )
  })

  // 移除字符
  const removeStrings = ref<string[]>([])
  function setRemoveStrings(strings: string[]) {
    removeStrings.value = strings
  }
  const removeQuery = useQuery<NameMap[]>({
    key: () => [
      path.value,
      "remove",
      [...removeStrings.value].sort(),
      [...selectionStore.selectedDirs].sort()
    ],
    query: () =>
      removeStringsPreview({
        dir: path.value,
        targets: selectionStore.selectedDirs,
        strings: removeStrings.value
      }),
    enabled: computed(
      () => uiStore.operationOpen && uiStore.operationType === "移除字符"
    )
  })

  // 替换中文
  const replaceQuery = useQuery<NameMap[]>({
    key: () => [path.value, "replace", [...selectionStore.selectedDirs].sort()],
    query: () =>
      replaceChinesePreview({
        dir: path.value,
        targets: selectionStore.selectedDirs
      }),
    enabled: computed(
      () => uiStore.operationOpen && uiStore.operationType === "替换中文"
    )
  })

  const queryCache = useQueryCache()
  function refetchData() {
    queryCache.invalidateQueries({ key: [path.value] })
  }
  // 创建文件夹
  const createMutation = useMutation({
    mutation: (name: string) => createDir(`${path.value}/${name}`),
    onSuccess: () => refetchData()
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
    onSettled: () => refetchData()
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
    onSuccess: () => refetchData()
  })

  return {
    files: fileQuery.data,
    isLoading: fileQuery.isLoading,
    error: fileQuery.error,
    refresh: queryCache.invalidateQueries,

    renameData: renameQuery.data,
    removeData: removeQuery.data,
    replaceData: replaceQuery.data,
    isRenamePreviewing: renameQuery.isLoading,
    isRemovePreviewing: removeQuery.isLoading,
    isReplacePreviewing: replaceQuery.isLoading,
    setRemoveStrings,

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
