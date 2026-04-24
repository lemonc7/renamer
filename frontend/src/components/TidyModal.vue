<template>
  <UModal
    v-model:open="uiStore.tidyOpen"
    title="整理剧集"
    description="新建剧集目录，并将多季剧集整理到该目录中"
  >
    <template #body>
      <UForm
        id="tidy-series"
        ref="formRef"
        :schema="schema"
        :state="state"
        @submit="handleSubmit"
        :validate-on="['change']"
        class="space-y-4"
      >
        <UFormField label="剧集名称" name="seriesName" required>
          <UInput
            v-model="state.seriesName"
            placeholder="请输入剧集名称"
            class="w-full"
            autofocus
          />
        </UFormField>
        <UFormField label="季数映射" name="seasonNames" required>
          <SeriesTable
            :series="state.seasonNames"
            @change="handleSeasonChange"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          label="取消"
          variant="outline"
          @click="uiStore.tidyOpen = false"
          color="neutral"
        />
        <UButton
          label="确定"
          type="submit"
          form="tidy-series"
          :loading="isTiding"
          color="neutral"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"
import { nextTick, reactive, ref, watch } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"
import SeriesTable from "./SeriesTable.vue"
import { useSelectionStore } from "../stores/selection"

const toast = useToast()
const { tidySeries, isTiding } = useFiles()
const uiStore = useUiStore()
const selectionStore = useSelectionStore()
const formRef = ref()

const schema = z.object({
  seriesName: z.string().trim().min(1, "请输入剧集名称"),
  seasonNames: z
    .array(
      z.object({
        oldName: z.string().trim().min(1),
        newName: z.string().trim().min(1, "请选择剧集")
      })
    )
    .superRefine((data, ctx) => {
      const nameMap = new Map<string, number[]>()
      data.forEach((item, index) => {
        // 空值跳过
        if (!item.newName) return

        // 重复性统计
        if (!nameMap.has(item.newName)) {
          nameMap.set(item.newName, [])
        }
        nameMap.get(item.newName)!.push(index)
      })

      // 遍历统计结果，如果某个季数出现超过1次，给所有索引都打上标记
      for (const indices of nameMap.values()) {
        if (indices.length > 1) {
          indices.forEach((index) => {
            ctx.addIssue({
              code: "custom",
              message: "季名称重复",
              path: [index, "newName"]
            })
          })
        }
      }
    })
})
type Schema = z.infer<typeof schema>
const state = reactive<Schema>({ seriesName: "", seasonNames: [] })

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  const { seriesName, seasonNames } = event.data

  try {
    await tidySeries({
      seriesName: seriesName,
      seasonNames: seasonNames
    })

    toast.add({
      title: "整理剧集成功",
      color: "success"
    })
  } catch (e) {
    toast.add({
      title: "整理剧集失败",
      color: "error"
    })
    console.error("整理剧集失败: ", e)
  } finally {
    uiStore.tidyOpen = false
  }
}

async function handleSeasonChange() {
  // 等待数据状态更新
  await nextTick()
  if (formRef.value) {
    try {
      await formRef.value.validate({
        path: "seasonNames",
        silent: true
      })
    } catch (e) {
      // 什么都不做，避免控制台报错
    }
  }
}

watch(
  () => uiStore.tidyOpen,
  (isOpen, prev) => {
    if (isOpen && !prev) {
      state.seriesName = ""
      state.seasonNames = selectionStore.selectedDirs.map((dir) => ({
        oldName: dir,
        newName: ""
      }))
    }
  }
)
</script>
