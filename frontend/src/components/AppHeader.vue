<script setup lang="ts">
import { useRouter } from "vue-router"
import { useFiles } from "../composables/useFiles"
import CreateModal from "./CreateModal.vue"
import DeleteModal from "./DeleteModal.vue"
import MoveModal from "./MoveModal.vue"

const router = useRouter()
const toast = useToast()
const { refetch } = useFiles()

async function handleRefresh() {
  const result = await refetch()
  if (result.status === "error") {
    toast.add({
      title: "刷新失败",
      description: "请检查网络连接后重试。",
      color: "error",
      icon: "i-lucide-x-circle"
    })
    console.log("刷新文件信息失败: ", result.error)
  } else {
    toast.add({
      title: "刷新成功",
      description: "文件信息已同步至最新状态。",
      color: "success",
      icon: "i-lucide-check-circle"
    })
  }
}
</script>

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
      <USeparator orientation="vertical" class="h-6" type="solid" />
      <UColorModeButton />
    </div>
    <div class="flex items-center gap-2">
      <DeleteModal />
      <MoveModal />
      <CreateModal />
      <UButton
        icon="i-lucide-rotate-cw"
        color="neutral"
        variant="ghost"
        @click="handleRefresh"
      />
    </div>
  </header>
</template>
