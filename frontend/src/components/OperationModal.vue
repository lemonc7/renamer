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
      <div>{{ draftTabs }}</div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"
import PreviewTable from "./PreviewTable.vue"
import type { Name, NameMap } from "../model"

const toast = useToast()
const { renameData, removeData, replaceData, renameBatch, isRenameBatching } =
  useFiles()
const uiStore = useUiStore()

// 定义本地草稿响应式数据
const draftTabs = ref<
  {
    label: string
    files: Name[]
  }[]
>([])

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
  (isOpen, prev) => {
    if (isOpen && !prev) {
      let sourceData: NameMap[] = []
      switch (uiStore.operationType) {
        case "重命名剧集":
          sourceData = renameData.value ?? []
          break
        case "移除字符":
          sourceData = removeData.value ?? []
          break
        case "替换中文":
          sourceData = replaceData.value ?? []
          break
      }

      // 使用 structuredClone 深拷贝数据，确保表格在编辑后不会影响原始数据
      draftTabs.value = sourceData.map((item) => ({
        label: item.dir,
        files: structuredClone(item.files)
      }))
    }
  },
  { immediate: true }
)
</script>
