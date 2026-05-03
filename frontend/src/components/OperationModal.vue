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
        variant="link"
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
          <UFieldGroup
            v-if="uiStore.operationType === '重命名剧集'"
            class="pb-1 flex justify-end"
          >
            <UInputNumber
              v-model="offsets[item.dir]"
              placeholder="剧集偏移..."
              orientation="vertical"
              class="max-w-30"
              color="neutral"
            />
            <UTooltip text="应用偏移">
              <UButton
                icon="i-lucide-list-restart"
                color="neutral"
                variant="outline"
                @click="applyOffset(item)"
              />
            </UTooltip>
          </UFieldGroup>
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
const offsets = ref<Record<string, number>>({})

async function fetchData() {
  const rawPath = decodeURIComponent(route.path)
  const req = {
    dir: !rawPath || rawPath === "/" ? "." : getCleanPath(rawPath),
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
    case "整理剧集":
      throw Error("operationType错误")
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

function applyOffset(item: NameMap) {
  const offset = offsets.value[item.dir]
  if (!offset || offset === 0) return

  const epRe = /E(\d+(?:\.\d)?)/g
  for (const name of item.files) {
    for (const m of name.newName.matchAll(epRe)) {
      const newVal = parseFloat(m[1]) + offset
      if (Math.floor(newVal) < 1) {
        toast.add({
          title: "剧集偏移",
          description: "偏移后集数不能小于1，请调整偏移量",
          color: "error"
        })
        return
      }
    }
  }

  item.files.forEach((name) => {
    name.newName = name.newName.replace(epRe, (_match, num) => {
      const isHalf = num.includes(".")
      const newVal = parseFloat(num) + offset

      if (isHalf) {
        return "E" + String(newVal)
      }

      const intVal = Math.floor(newVal)
      return "E" + String(intVal).padStart(2, "0")
    })
  })

  offsets.value[item.dir] = 0
}

watch(
  () => uiStore.operationOpen,
  async (isOpen, prev) => {
    if (isOpen && !prev) {
      // 清空旧数据
      nameMaps.value = []
      offsets.value = {}

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
