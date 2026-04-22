<template>
  <UModal
    v-model:open="uiStore.operationOpen"
    :ui="{
      content: 'sm:max-w-[50vw] h-[90vh] flex flex-col',
      body: 'flex-1 min-h-0 overflow-hidden'
    }"
    :title="uiStore.operationType"
  >
    <template #body>
      <UTabs
        :items="nameMaps"
        class="h-full flex flex-col"
        :ui="{
          // list: 允许横向滚动 + 强制不换行
          list: 'overflow-x-auto flex-nowrap hide-scrollbar scroll-smooth shrink-0',
          // trigger: 限制最大宽度 + 防止被挤压
          trigger: 'max-w-32 shrink-0',
          content: 'flex-1 min-h-0'
        }"
      >
        <!-- 标题 -->
        <template #default="{ item }">
          <UTooltip :text="item.dir" :key="item.dir">
            <span>
              {{ item.dir }}
            </span>
          </UTooltip>
        </template>
        <!-- 内容 -->
        <template #content="{ item }">
          <PreviewTable :files="item.files" class="h-full" />
        </template>
      </UTabs>
    </template>
    <template #footer>
      <div class="w-full flex items-center justify-end gap-2">
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
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useUiStore } from "../stores/ui"
import PreviewTable from "./PreviewTable.vue"
import type { NameMap } from "../model"
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

const nameMaps = ref<NameMap[]>([])

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
  try {
    await renameBatch(nameMaps.value)
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
      nameMaps.value = []

      try {
        const res = await fetchData()
        if (uiStore.operationOpen) {
          nameMaps.value = res
        }
      } catch (e) {
        console.error("加载数据出错: ", e)
      }
    }
  }
)
</script>
