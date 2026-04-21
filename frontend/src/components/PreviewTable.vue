<template>
  <div class="flex flex-col flex-1 w-full h-full">
    <UTable
      :data="props.files"
      :columns="columns"
      sticky="header"
      class="w-full"
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
        th: "whitespace-nowrap",
        td: "truncate"
      }
    }
  },
  {
    id: "separator",
    cell: () =>
      h(UIcon, {
        name: "i-lucide-move-right"
      }),
    meta: {
      class: {
        th: "w-5 text-center",
        td: "w-5 text-center"
      }
    }
  },
  {
    accessorKey: "newName",
    header: "新名称",
    cell: ({ row }) =>
      h(UInput, {
        modelValue: row.original.newName,
        variant: "soft",
        color: "neutral",
        class: "w-full",
        placeholder: "新名称...",
        "onUpdate:modelValue": (value: string) => {
          row.original.newName = value
        }
      }),
    meta: {
      class: {
        th: "w-1/2 whitespace-nowrap",
        td: "w-1/2 whitespace-nowrap"
      }
    }
  }
]
</script>
