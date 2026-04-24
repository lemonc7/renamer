<template>
  <UModal
    v-model:open="uiStore.removeOpen"
    title="移除字符"
    description="输入待移除的字符，多个用 , 分隔"
  >
    <template #body>
      <UForm
        id="remove-strings"
        :schema="schema"
        :state="state"
        @submit="handleSubmit"
        :validate-on="['change']"
        class="space-y-4"
      >
        <UFormField label="字符" name="strings" required>
          <UInput
            v-model="state.strings"
            placeholder="请输入待移除的字符"
            class="w-full"
            autofocus
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          label="取消"
          variant="outline"
          @click="uiStore.removeOpen = false"
          color="neutral"
        />
        <UButton
          label="确认"
          type="submit"
          color="neutral"
          form="remove-strings"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod"
import { useUiStore } from "../stores/ui"
import { reactive, watch } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"

const uiStore = useUiStore()

const schema = z.object({
  strings: z.string().trim().nonempty("请输入待移除的字符")
})
type Schema = z.output<typeof schema>
const initialState: Schema = {
  strings: ""
}
const state = reactive<Schema>({ ...initialState })

function handleSubmit(event: FormSubmitEvent<Schema>) {
  uiStore.removeStrings = event.data.strings.split(",")
  uiStore.operationOpen = true
  uiStore.removeOpen = false
}

watch(
  () => uiStore.removeOpen,
  (isOpen, prev) => {
    if (isOpen && !prev) {
      Object.assign(state, initialState)
    }
  }
)
</script>
