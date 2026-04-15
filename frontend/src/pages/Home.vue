<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-2">
      <UInput
        id="name-filter"
        name="name-filter"
        :model-value="
          table?.tableApi.getColumn('name')?.getFilterValue() as string
        "
        class="max-w-sm"
        placeholder="过滤名称..."
        @update:model-value="
          table?.tableApi.getColumn('name')?.setFilterValue($event)
        "
      />
    </div>
    <UTable
      ref="table"
      :data="files"
      :columns="columns"
      sticky="header"
      v-model:row-selection="rowSelection"
      v-model:column-filters="columnFilters"
      :get-row-id="(row) => row.id"
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
import { useFiles } from "../composables/useFiles"
import type { TableColumn } from "@nuxt/ui"
import type { FileInfo } from "../model"
import { h, ref, resolveComponent, useTemplateRef } from "vue"

const UCheckbox = resolveComponent("UCheckbox")

const { files } = useFiles()

const table = useTemplateRef("table")

const columns: TableColumn<FileInfo>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        id: "select-all",
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all"
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        id: `select-row-${row.id}`,
        name: `select-row-${row.id}`,
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row"
      })
  },
  {
    accessorKey: "name",
    header: "名称"
  },
  {
    accessorKey: "size",
    header: "大小"
  },
  {
    accessorKey: "ext",
    header: "类型"
  },
  {
    accessorKey: "modTime",
    header: "修改时间",
    meta: {
      class: {
        th: "text-right",
        td: "text-right tabular-nums whitespace-nowrap"
      }
    }
  }
]

const columnFilters = ref([
  {
    id: "name",
    value: ""
  }
])
const rowSelection = ref<Record<string, boolean>>({})
</script>
