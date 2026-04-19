<template></template>

<script setup lang="ts">
import { computed } from "vue"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"

const {
  renameData,
  removeData,
  replaceData,
  isRenamePreviewing,
  isRemovePreviewing,
  isReplacePreviewing
} = useFiles()

const uiStore = useUiStore()

const state = computed(() => {
  switch (uiStore.operation.type) {
    case "移除字符":
      return { data: removeData, loading: isRemovePreviewing }
    case "替换中文":
      return { data: replaceData, loading: isReplacePreviewing }
    case "重命名剧集":
      return { data: renameData, loading: isRenamePreviewing }
  }
})
</script>
