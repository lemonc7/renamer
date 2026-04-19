<template>
  <UModal
    v-model:open="uiStore.deleteOpen"
    title="删除"
    description="删除操作无法撤销！请确认是否删除？"
  >
    <UChip :text="selectionStore.selectedNames.length" size="3xl">
      <UButton icon="i-lucide-trash" color="error" variant="soft" />
    </UChip>

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="outline"
          @click="uiStore.deleteOpen = false"
        />
        <UButton
          label="删除"
          color="error"
          @click="handleSubmit"
          :loading="isDeleting"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useFiles } from "../composables/useFiles"
import { useSelectionStore } from "../stores/selection"
import { useUiStore } from "../stores/ui"

const toast = useToast()
const { deleteItems, isDeleting } = useFiles()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()

async function handleSubmit() {
  const targets = selectionStore.selectedFile
    ? [selectionStore.selectedFile.name]
    : selectionStore.selectedNames

  try {
    await deleteItems({ targets })
    toast.add({
      title: "删除成功",
      color: "success"
    })
  } catch (e) {
    toast.add({
      title: "删除失败",
      color: "error"
    })
    console.error("删除文件失败: ", e)
  } finally {
    uiStore.deleteOpen = false
    // 将选中的文件重置为null，避免targets批量删除失败
    selectionStore.selectedFile = null
  }
}
</script>
