<template>
  <header
    class="h-14 shrink-0 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800"
  >
    <div class="flex items-center gap-2">
      <UButton
        icon="line-md:home"
        color="neutral"
        variant="ghost"
        @click="router.push('/')"
        >主页</UButton
      >
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
      <UTooltip text="刷新目录">
        <UButton
          icon="i-lucide-rotate-cw"
          color="neutral"
          variant="ghost"
          @click="handleRefresh"
        />
      </UTooltip>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useFiles } from "../composables/useFiles"
import CreateModal from "./CreateModal.vue"
import DeleteModal from "./DeleteModal.vue"
import { useSelectionStore } from "../stores/selection"
import { useUiStore } from "../stores/ui"

const router = useRouter()
const toast = useToast()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()
const { refresh } = useFiles()

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
</script>
