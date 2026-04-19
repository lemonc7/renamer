<template>
  <UModal
    v-model:open="uiStore.renameOpen"
    title="重命名"
    description="请输入合法的新名称"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        @submit="handleSubmit"
        :validate-on="['change']"
        class="space-y-4"
      >
        <UFormField label="名称" name="name" required>
          <UInput
            ref="inputRef"
            v-model="state.name"
            placeholder="请输入新名称"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="取消"
            variant="outline"
            @click="uiStore.renameOpen = false"
            color="neutral"
          />
          <UButton
            label="更新"
            type="submit"
            :loading="isRenaming"
            color="neutral"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useFiles } from "../composables/useFiles"
import { useUiStore } from "../stores/ui"
import z from "zod"
import { validateFilename } from "../utils/validate_filename"
import { nextTick, reactive, ref, watch } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"
import { useSelectionStore } from "../stores/selection"

const toast = useToast()
const { renameItem, isRenaming } = useFiles()
const uiStore = useUiStore()
const selectionStore = useSelectionStore()

const inputRef = ref()

const schema = z.object({
  name: z
    .string()
    .nonempty("请输入新名称")
    .max(30, "新名称不能超过30个字符")
    .trim()
    .refine((name) => validateFilename(name), {
      error: "新名称不能包含非法字符"
    })
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({ name: "" })

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await renameItem(event.data.name)
    toast.add({
      title: "重命名成功",
      color: "success"
    })
    uiStore.renameOpen = false
  } catch (e) {
    console.error("重命名失败: ", e)
  }
}

watch(
  () => uiStore.renameOpen,
  async (isOpen) => {
    if (isOpen && selectionStore.selectedFile) {
      const file = selectionStore.selectedFile
      state.name = file.name

      // 等待DOM更新
      await nextTick()

      setTimeout(() => {
        const inputEl = inputRef.value?.$el?.querySelector(
          "input"
        ) as HTMLInputElement
        if (!inputEl) return

        // 手动聚焦
        inputEl.focus()

        let selectionEnd = file.name.length
        if (!file.isDir && file.ext) {
          selectionEnd = file.name.length - (file.ext.length + 1)
        }

        // 防止 selectionEnd 变成负数
        inputEl.setSelectionRange(0, Math.max(0, selectionEnd))
      }, 200)
    }
  }
)
</script>
