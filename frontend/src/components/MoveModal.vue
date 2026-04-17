<template>
  <UDrawer
    title="移动文件"
    description="移动文件到目标目录"
    v-model:open="open"
    direction="right"
    inset
  >
    <UButton
      icon="i-lucide-folder-output"
      color="neutral"
      variant="outline"
      v-if="selectionStore.selectedNames.length"
    />
    <template #body>
      

    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useSelectionStore } from "../stores/selection"

const open = ref(false)
const selectionStore = useSelectionStore()
</script>
