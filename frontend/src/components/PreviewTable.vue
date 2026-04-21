<template>
  <div class="flex flex-col flex-1 w-full h-full">
    <UTable
      :data="props.files"
      :columns="columns"
      sticky="header"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
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
import type { TableColumn } from "@nuxt/ui"
import type { Name } from "../model"
import { h, resolveComponent } from "vue"

const props = defineProps<{
  files: Name[]
}>()

const UIcon = resolveComponent("UIcon")
const UInput = resolveComponent("UInput")

const columns: TableColumn<Name>[] = [
  {
    accessorKey: "oldName",
    header: "原名称",
    meta: {
      class: {
        th: "w-1/2",
        td: "w-1/2 truncate"
      }
    }
  },
  {
    id: "separator",
    cell: () =>
      h(UIcon, {
        class: "w-10",
        name: "i-lucide-move-right"
      })
  },
  {
    accessorKey: "newName",
    header: "新名称",
    cell: ({ row }) =>
      h(UInput, {
        modelValue: row.original.newName,
        variant: "none",
        color: "neutral",
        placeholder: "新名称...",
        "onUpdate:modelValue": (value: string) => {
          row.original.newName = value
        }
      })
  }
]
</script>
