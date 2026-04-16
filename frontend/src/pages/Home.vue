<template>
  <div class="flex flex-col flex-1 w-full h-full">
    <div class="flex items-center justify-between shrink-0 mb-2">
      <Breadcrumb />
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
import { useRoute, useRouter } from "vue-router"
import Breadcrumb from "../components/Breadcrumb.vue"

const UCheckbox = resolveComponent("UCheckbox")
const UIcon = resolveComponent("UIcon")
const router = useRouter()
const route = useRoute()

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
    header: "名称",
    cell: ({ row }) => {
      const file = row.original
      return h(
        "div",
        {
          class: [
            "flex items-center gap-2",
            file.isDir
              ? "cursor-pointer hover:text-primary-500 transition-colors"
              : ""
          ],
          onClick: () => {
            if (file.isDir) {
              const currentPath = route.fullPath
              const newPath = currentPath.endsWith("/")
                ? `${currentPath}${file.name}`
                : `${currentPath}/${file.name}`
              router.push(newPath)
            }
          }
        },
        [
          h(UIcon, {
            name: file.isDir
              ? "i-heroicons-folder-solid"
              : "i-heroicons-document",
            class: "w-5 h-5 flex-shrink-0"
          }),
          h("span", { class: "truncate" }, file.name)
        ]
      )
    }
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
