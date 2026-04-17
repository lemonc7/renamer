<template>
  <UModal
    v-model:open="open"
    title="删除"
    description="删除操作无法撤销！请确认是否删除？"
  >
    <UChip
      :text="selectionStore.selectedNames.length"
      v-if="selectionStore.selectedNames.length"
      size="3xl"
    >
      <UButton icon="i-lucide-trash" color="error" variant="soft" />
    </UChip>

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="outline"
          @click="open = false"
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
import { ref } from "vue"
import { useFiles } from "../composables/useFiles"
import { useSelectionStore } from "../stores/selection"
import type { DeleteRequest } from "../model"
import { useRoute } from "vue-router"
import { getCleanPath } from "../utils/path"

const open = ref(false)
const route = useRoute()
const toast = useToast()

const { deleteItems, isDeleting } = useFiles()
const selectionStore = useSelectionStore()

async function handleSubmit() {
  const cleanPath = getCleanPath(route.path)
  const req: DeleteRequest = {
    dir: cleanPath,
    targets: selectionStore.selectedNames
  }

  try {
    await deleteItems(req)
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
    open.value = false
  }
}
</script>
