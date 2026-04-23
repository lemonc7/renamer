<template>
  <UModal
    v-model:open="uiStore.tidyOpen"
    title="整理剧集"
    description="新建剧集目录，并将多季剧集整理到该目录中"
  >
    <template #body>
      <UForm
        id="tidy-series"
        :schema="schema"
        :state="state"
        @submit="handleSubmit"
        :validate-on="['blur']"
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
          <SeriesTable :series="state.seasonNames" />
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
import z from "zod"
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"
import { reactive, watch } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"
import SeriesTable from "./SeriesTable.vue"
import { useSelectionStore } from "../stores/selection"

const toast = useToast()
const { tidySeries, isTiding } = useFiles()
const uiStore = useUiStore()
const selectionStore = useSelectionStore()

const seasonNameSchema = z.object({
  oldName: z.string().trim().min(1, "源文件夹名称不能为空"),
  newName: z
    .string()
    .trim()
    .regex(/^S\d{2,}$/i, "请选择季数")
})

const schema = z.object({
  seriesName: z.string().trim().min(1, "请输入剧集名称"),
  seasonNames: z
    .array(seasonNameSchema)
    .min(1, "至少需要包含一季")
    .superRefine((data, ctx) => {
      // 提取所有的季数
      const names = data.map((item) => item.newName)

      // 处理重复项
      data.forEach((item, index) => {
        if (!item.newName) return

        if (names.indexOf(item.newName) !== index) {
          ctx.addIssue({
            code: "custom",
            message: "季名称重复",
            path: [index, "newName"]
          })
        }
      })
    })
})
type Schema = z.infer<typeof schema>
const state = reactive<Schema>({ seriesName: "", seasonNames: [] })

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await tidySeries({
      seriesName: event.data.seriesName,
      seasonNames: event.data.seasonNames
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
