<template>
  <header
    class="h-14 shrink-0 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800"
  >
    <div class="flex items-center gap-2">
      <UTooltip text="返回主页">
        <UButton
          icon="line-md:home"
          color="neutral"
          variant="ghost"
          @click="router.push('/')"
        />
      </UTooltip>
      <UTooltip text="刷新目录">
        <UButton
          icon="i-lucide-rotate-cw"
          color="neutral"
          variant="ghost"
          @click="handleRefresh"
        />
      </UTooltip>
      <USeparator orientation="vertical" class="h-6" />
      <UTooltip text="切换主题">
        <UColorModeButton />
      </UTooltip>
    </div>
    <div class="flex items-center gap-2">
      <div
        v-show="selectionStore.selectedNames.length"
        class="flex items-center gap-2"
      >
        <UTooltip text="删除文件">
          <DeleteModal />
        </UTooltip>
        <USeparator orientation="vertical" class="h-6" />
        <UFieldGroup>
          <UTooltip text="移动文件">
            <UButton
              icon="i-lucide-folder-output"
              color="neutral"
              variant="outline"
              class="w-10 justify-center"
              @click="uiStore.copyOrMove = { open: true, type: '移动' }"
            />
          </UTooltip>
          <UTooltip text="复制文件">
            <UButton
              icon="i-lucide-folders"
              color="neutral"
              variant="outline"
              class="w-10 justify-center"
              @click="uiStore.copyOrMove = { open: true, type: '复制' }"
            />
          </UTooltip>
        </UFieldGroup>
        <USeparator orientation="vertical" class="h-6" />
      </div>
      <CreateModal />
      <USeparator orientation="vertical" class="h-6" />
      <UFieldGroup>
        <USelect
          :items="selectItems"
          v-model="uiStore.operationType"
          class="w-30"
        />
        <UButton
          icon="i-lucide-folder-pen"
          :disabled="selectionStore.selectedDirs.length === 0"
          @click="handleOperation"
          color="neutral"
        />
      </UFieldGroup>
    </div>
  </header>
  <RemoveModal />
  <TidyModal />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useFiles } from "../composables/useFiles"
import CreateModal from "./CreateModal.vue"
import DeleteModal from "./DeleteModal.vue"
import { useSelectionStore } from "../stores/selection"
import { useUiStore } from "../stores/ui"
import { ref } from "vue"
import type { OperationType } from "../model"
import RemoveModal from "./RemoveModal.vue"

const router = useRouter()
const toast = useToast()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()
const { refresh } = useFiles()
const selectItems = ref<OperationType[]>([
  "重命名剧集",
  "移除字符",
  "替换中文",
  "整理剧集"
])

async function handleRefresh() {
  try {
    await refresh()
    toast.add({
      title: "刷新成功",
      description: "文件信息已同步至最新状态。",
      color: "success",
      icon: "i-lucide-check-circle"
    })
  } catch (e) {
    toast.add({
      title: "刷新失败",
      description: "请检查网络连接后重试。",
      color: "error",
      icon: "i-lucide-x-circle"
    })
    console.error("刷新文件信息失败: ", e)
  }
}

function handleOperation() {
  switch (uiStore.operationType) {
    case "移除字符":
      uiStore.removeOpen = true
      break
    case "整理剧集":
      uiStore.tidyOpen = true
      break
    default:
      uiStore.operationOpen = true
      break
  }
}
</script>
