<template>
  <UModal v-model:open="uiStore.operationOpen">
    <template #header>
      <div class="w-full flex items-center justify-between">
        <span class="text-xl font-black">{{ uiStore.operationType }}</span>
        <div class="flex items-center gap-2">
          <UButton
            label="确认"
            color="neutral"
            @click="handleSubmit"
            :loading="isRenameBatching"
          />
          <UButton
            label="取消"
            color="neutral"
            variant="outline"
            @click="uiStore.operationOpen = false"
          />
        </div>
      </div>
    </template>
    <template #body>
      <UTabs :items="draftTabs">
        <template #content="{ item }">
          <PreviewTable :files="item.files" />
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useUiStore } from "../stores/ui"
import PreviewTable from "./PreviewTable.vue"
import type { Name, NameMap } from "../model"
import { useFiles } from "../composables/useFiles"
import { useRoute } from "vue-router"
import { useSelectionStore } from "../stores/selection"
import {
  removeStringsPreview,
  renamePreview,
  replaceChinesePreview
} from "../api"
import { getCleanPath } from "../utils/path"

const toast = useToast()
const route = useRoute()
const uiStore = useUiStore()
const selectionStore = useSelectionStore()
const { renameBatch, isRenameBatching } = useFiles()

// 定义本地草稿响应式数据
const draftTabs = ref<
  {
    label: string
    files: Name[]
  }[]
>([])

async function fetchData() {
  const req = {
    dir: !route.path || route.path === "/" ? "." : getCleanPath(route.path),
    targets: selectionStore.selectedDirs
  }
  switch (uiStore.operationType) {
    case "重命名剧集":
      return await renamePreview(req)
    case "替换中文":
      return await replaceChinesePreview(req)
    case "移除字符":
      return await removeStringsPreview({
        strings: uiStore.removeStrings,
        ...req
      })
  }
}

async function handleSubmit() {
  const payload: NameMap[] = draftTabs.value.map((tab) => ({
    dir: tab.label,
    files: tab.files
  }))

  try {
    await renameBatch(payload)
    toast.add({
      title: `${uiStore.operationType}成功`,
      color: "success"
    })
  } catch (e) {
    toast.add({
      title: `${uiStore.operationType}失败`,
      color: "error"
    })
    console.error(`${uiStore.operationType}失败: `, e)
  } finally {
    uiStore.operationOpen = false
  }
}

watch(
  () => uiStore.operationOpen,
  async (isOpen, prev) => {
    if (isOpen && !prev) {
      // 清空旧数据
      draftTabs.value = []

      try {
        const res = await fetchData()
        if (uiStore.operationOpen) {
          draftTabs.value = res.map((item) => ({
            label: item.dir,
            files: item.files
          }))
        }
      } catch (e) {
        console.error("加载数据出错: ", e)
      }
    }
  }
)
</script>
