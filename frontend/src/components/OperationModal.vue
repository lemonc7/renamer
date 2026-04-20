<template>
  <UModal v-model:open="uiStore.operationOpen" :title="uiStore.operationType">
    <template #body>
      <UTabs :items="tabs">
        <template #content="{ item }">
          <PreviewTable :files="item.data" :type="item.type" />
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"
import PreviewTable from "./PreviewTable.vue"
import type { Name, OperationType } from "../model"

const { renameData, removeData, replaceData } = useFiles()

const uiStore = useUiStore()

const tabs = computed<
  {
    label: string
    data: Name[]
    type: OperationType
  }[]
>(() => {
  switch (uiStore.operationType) {
    case "重命名剧集":
      return (renameData.value ?? []).map((item) => ({
        label: item.dir,
        data: item.files,
        type: "重命名剧集"
      }))
    case "移除字符":
      return (removeData.value ?? []).map((item) => ({
        label: item.dir,
        data: item.files,
        type: "移除字符"
      }))
    case "替换中文":
      return (replaceData.value ?? []).map((item) => ({
        label: item.dir,
        data: item.files,
        type: "替换中文"
      }))
  }
})
</script>
