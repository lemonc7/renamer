<template>
  <UDrawer v-model:open="uiStore.operation.open" direction="right" inset>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-xl font-black">{{ uiStore.operation.type }}</span>
        <div class="flex items-center gap-2">
          <UButton
            label="确认"
            color="neutral"
            :loading="uiStore.operation.type === '移动' ? isMoving : isCoping"
            @click="handleSubmit"
          />
          <UButton
            label="取消"
            color="neutral"
            variant="outline"
            @click="uiStore.operation.open = false"
          />
        </div>
      </div>
    </template>

    <template #body>
      <div
        class="max-h-160 w-120 overflow-y-auto p-2 border rounded-lg bg-gray-50/50"
      >
        <div v-if="rootNodes.length > 0" class="inline-block min-w-full">
          <FolderTreeItem
            v-for="node in rootNodes"
            :key="node.path"
            :node="node"
            :depth="0"
            v-model="selectedFolder"
          />
        </div>
        <div v-else class="flex flex-col items-center py-10 text-gray-400">
          <UIcon
            name="i-lucide-folder-open"
            class="w-10 h-10 mb-2 opacity-20"
          />
          <p class="text-sm">加载中或无可用目录...</p>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useSelectionStore } from "../stores/selection"
import type { Node } from "../model"
import { getDirs } from "../api"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"

const toast = useToast()
const selectionStore = useSelectionStore()
const selectedFolder = ref<string>("")

const rootNodes = ref<Node[]>([])

const { moveItems, copyItems, isMoving, isCoping } = useFiles()
const uiStore = useUiStore()

async function handleSubmit() {
  const req = {
    targetDir: selectedFolder.value,
    originals: selectionStore.selectedFile
      ? [selectionStore.selectedFile.name]
      : selectionStore.selectedNames
  }

  try {
    if (uiStore.operation.type === "移动") {
      await moveItems(req)
    } else {
      await copyItems(req)
    }
    toast.add({
      title: `${uiStore.operation.type}成功`,
      color: "success"
    })
  } catch (e) {
    toast.add({
      title: `${uiStore.operation.type}失败`,
      color: "error"
    })
    console.error(`${uiStore.operation.type}文件失败: `, e)
  } finally {
    // 复制或移动文件报错，可能有部分文件已更改，应关闭模态框，并刷新文件信息
    uiStore.operation.open = false
    selectionStore.selectedFile = null
  }
}

// 监听弹窗状态，打开时清空选择的目标路径，并请求根目录节点
watch(
  () => uiStore.operation.open,
  async (isOpen, prev) => {
    if (isOpen && !prev) {
      // 清除选中项
      selectedFolder.value = ""
      // 先清空旧节点，避免展示旧数据
      rootNodes.value = []
      try {
        const res = await getDirs(".")
        // 获取目录后，如果弹窗是开启状态，更新目录节点
        if (uiStore.operation.open) {
          rootNodes.value = res
        }
      } catch (e) {
        console.error("加载根目录失败")
      }
    }
  }
)
</script>
