<template>
  <UModal
    v-model:open="uiStore.createOpen"
    title="新建文件夹"
    description="请输入合法的文件夹名称"
  >
    <UButton icon="i-lucide-folder-plus" color="neutral" label="新建" />

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
            v-model="state.name"
            placeholder="请输入名称"
            class="w-full"
            autofocus
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="取消"
            variant="outline"
            @click="uiStore.createOpen = false"
            @pointerdown.stop
            color="neutral"
          />
          <UButton
            label="创建"
            type="submit"
            :loading="isCreating"
            color="neutral"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue"
import { useFiles } from "../composables/useFiles"
import { z } from "zod"
import type { FormSubmitEvent } from "@nuxt/ui"
import { useUiStore } from "../stores/ui"
import { validateFilename } from "../utils/validate_filename"

const toast = useToast()
const { isCreating, createDir } = useFiles()
const uiStore = useUiStore()

const schema = z.object({
  name: z
    .string()
    .nonempty("请输入文件夹名称")
    .max(30, "文件夹名称不能超过30个字符")
    .trim()
    .refine((name) => validateFilename(name), {
      error: "文件夹名称不能包含非法字符"
    })
})
type Schema = z.output<typeof schema>
const initialState: Schema = {
  name: ""
}
const state = reactive<Schema>({ ...initialState })

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await createDir(event.data.name)
    toast.add({
      title: "创建成功",
      color: "success"
    })
    uiStore.createOpen = false
  } catch (e) {
    console.error("创建文件夹失败: ", e)
  }
}

// 监听模态框，打开时重置表单
watch(
  () => uiStore.createOpen,
  (isOpen, prev) => {
    // 模态框从关闭变成打开
    if (isOpen && !prev) {
      Object.assign(state, initialState)
    }
  }
)
</script>
