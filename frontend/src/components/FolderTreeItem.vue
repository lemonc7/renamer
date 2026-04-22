<template>
  <div class="select-none w-full">
    <!-- 渲染当前文件夹 -->
    <div
      class="flex items-center py-1.5 px-2 my-0.5 cursor-pointer rounded-md transition-colors group"
      :class="[
        modelValue === node.path
          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
          : 'hover:bg-muted'
      ]"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="selectFolder"
      @dblclick="toggleExpand"
    >
      <!-- 展开按钮 -->
      <div
        v-if="node.hasChildren"
        class="w-5 h-5 flex items-center justify-center mr-1 hover:bg-muted rounded"
        @click.stop="toggleExpand"
      >
        <UIcon
          v-if="!isLoading"
          :name="
            isExpanded
              ? 'i-heroicons-chevron-down-20-solid'
              : 'i-heroicons-chevron-right-20-solid'
          "
          class="w-4 h-4 text-muted"
        />
        <UIcon
          v-else
          name="i-heroicons-arrow-path"
          class="w-3.5 h-3.5 animate-spin text-primary"
        />
      </div>

      <!-- 文件夹图标 -->
      <UIcon
        :name="isExpanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
        class="w-5 h-5 mr-2"
        :class="[
          modelValue === node.path ? 'text-primary' : 'text-muted',
          !node.hasChildren && 'ml-6'
        ]"
      />

      <!-- 文件夹名称 -->
      <span class="text-sm truncate flex-1">{{ node.name }}</span>
    </div>

    <!-- 展开时，递归渲染文件夹 -->
    <div v-if="isExpanded && children.length > 0">
      <FolderTreeItem
        v-for="child in children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :model-value="modelValue"
        @update:model-value="onChildSelect"
      />
    </div>
    <div
      v-else-if="isExpanded && hasLoaded && children.length === 0"
      class="text-[12px] text-muted italic"
      :style="{ paddingLeft: `${(depth + 1) * 16 + 24}px` }"
    >
      (空文件夹)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type { Node } from "../model"
import { getDirs } from "../api"

const props = defineProps<{
  node: Node
  depth: number
  modelValue: string
}>()

const emit = defineEmits(["update:modelValue"])

// 是否展开
const isExpanded = ref(false)
// 是否正在加载子目录
const isLoading = ref(false)
// 子节点列表
const children = ref<Node[]>([])
// 是否已经加载过
const hasLoaded = ref(false)

// 展开/关闭
async function toggleExpand() {
  if (!props.node.hasChildren) return
  isExpanded.value = !isExpanded.value

  // 仅在第一次展开时请求后端
  if (isExpanded.value && !hasLoaded.value) {
    isLoading.value = true
    try {
      const res = await getDirs(props.node.path)
      children.value = res
      hasLoaded.value = true
    } catch (e) {
      isExpanded.value = false
      console.error("获取子目录失败: ", e)
    } finally {
      isLoading.value = false
    }
  }
}

// 选中文件夹逻辑
function selectFolder() {
  emit("update:modelValue", props.node.path)
}

// 透传选中的事件 (供递归调用使用)
function onChildSelect(path: string) {
  emit("update:modelValue", path)
}
</script>
