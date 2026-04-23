<template>
  <div class="flex flex-col flex-1 w-full h-full min-h-0 overflow-hidden">
    <UTable
      :data="props.series"
      :columns="columns"
      sticky="header"
      :ui="{
        base: 'w-full table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'py-2 border-b border-default',
        separator: 'h-0'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue"
import type { Name } from "../model"
import type { TableColumn } from "@nuxt/ui"

const props = defineProps<{
  series: Name[]
}>()

const emit = defineEmits<{
  (e: "change"): void
}>()

const UIcon = resolveComponent("UIcon")
const USelectMenu = resolveComponent("USelectMenu")
const UFormField = resolveComponent("UFormField")

const seasonOptions = Array.from(
  { length: 100 },
  (_, i) => `S${String(i).padStart(2, "0")}`
)

const columns: TableColumn<Name>[] = [
  {
    accessorKey: "oldName",
    header: "原名称"
  },
  {
    id: "separator",
    cell: () =>
      h(UIcon, {
        name: "i-lucide-move-right"
      })
  },
  {
    accessorKey: "newName",
    header: "新名称",
    cell: ({ row }) =>
      h(
        UFormField,
        {
          name: `seasonNames.${row.index}.newName`,
          class: "w-full"
        },
        {
          default: () =>
            h(USelectMenu, {
              modelValue: row.original.newName,
              class: "w-full",
              items: seasonOptions,
              placeholder: "选择季...",
              "onUpdate:modelValue": (value: string) => {
                row.original.newName = value
                emit("change")
              }
            })
        }
      )
  }
]
</script>
