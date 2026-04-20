<template>
  <CopyMoveModal />
  <RenameModal />
  <OperationModal />
  <div class="flex flex-col flex-1 w-full h-full">
    <div class="flex items-center justify-between shrink-0 mb-2">
      <Breadcrumb />
      <UFieldGroup>
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
        <UTooltip text="清除过滤">
          <UButton
            icon="ic:baseline-search-off"
            variant="outline"
            color="neutral"
            @click="clearFilter"
          />
        </UTooltip>
      </UFieldGroup>
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
import { h, ref, resolveComponent, useTemplateRef, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Breadcrumb from "../components/Breadcrumb.vue"
import { useSelectionStore } from "../stores/selection"
import { type Row } from "@tanstack/table-core"
import { useUiStore } from "../stores/ui"
import CopyMoveModal from "../components/CopyMoveModal.vue"

const UCheckbox = resolveComponent("UCheckbox")
const UIcon = resolveComponent("UIcon")
const UDropdownMenu = resolveComponent("UDropdownMenu")
const UButton = resolveComponent("UButton")

const router = useRouter()
const route = useRoute()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()

const { files } = useFiles()

const table = useTemplateRef("table")

// 操作菜单定义
function getRowItems(row: Row<FileInfo>) {
  return [
    {
      type: "label",
      label: "操作"
    },
    {
      type: "separator"
    },
    {
      label: "重命名",
      icon: "i-lucide-pencil",
      onSelect: () => {
        uiStore.renameOpen = true
        selectionStore.selectedFile = row.original
      }
    },
    {
      label: "移动",
      icon: "i-lucide-folder-output",
      onSelect: () => {
        uiStore.copyOrMove = {
          open: true,
          type: "移动"
        }
        selectionStore.selectedFile = row.original
      }
    },
    {
      label: "复制",
      icon: "i-lucide-folders",
      onSelect: () => {
        uiStore.copyOrMove = {
          open: true,
          type: "复制"
        }
        selectionStore.selectedFile = row.original
      }
    },
    {
      label: "删除",
      icon: "i-lucide-trash",
      color: "error",
      onSelect: () => {
        uiStore.deleteOpen = true
        selectionStore.selectedFile = row.original
      }
    }
  ]
}

// 表格定义
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
      }),
    meta: {
      class: {
        th: "w-1/24",
        td: "w-1/24"
      }
    }
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
              const currentPath = route.path
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
    },
    meta: {
      class: {
        th: "text-left",
        td: "text-left"
      }
    }
  },
  {
    accessorKey: "size",
    header: "大小",
    meta: {
      class: {
        th: "text-right w-1/10 whitespace-nowrap",
        td: "text-right w-1/10 whitespace-nowrap"
      }
    }
  },
  {
    accessorKey: "ext",
    header: "类型",
    meta: {
      class: {
        th: "text-center w-1/10 whitespace-nowrap",
        td: "text-center w-1/10 whitespace-nowrap"
      }
    }
  },
  {
    accessorKey: "modTime",
    header: "修改时间",
    meta: {
      class: {
        th: "text-right w-1/8 whitespace-nowrap",
        td: "text-right tabular-nums whitespace-nowrap w-1/8"
      }
    }
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "text-right"
        },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end"
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              variant: "ghost",
              class: "ml-auto"
            })
        )
      ),
    meta: {
      class: {
        th: "w-1/24",
        td: "w-1/24"
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

function clearFilter() {
  columnFilters.value = [
    {
      id: "name",
      value: ""
    }
  ]
}

const rowSelection = ref<Record<string, boolean>>({})

// 同步文件信息
watch(
  files,
  (val) => {
    if (val) selectionStore.setFiles(val)
  },
  { immediate: true }
)
// 同步选中的文件 ID
watch(
  () => rowSelection.value,
  () => selectionStore.setSelection(rowSelection.value),
  { immediate: true }
)
</script>
