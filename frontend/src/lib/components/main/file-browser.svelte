<script lang="ts">
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState
  } from "@tanstack/table-core"
  import { useFiles } from "src/hook/use-files.svelte"
  import type { FileInfo } from "src/model"
  import { createSvelteTable, renderComponent } from "../ui/data-table"
  import DataTableCheckbox from "./data-table-checkbox.svelte"
  import { navigate, route } from "src/router"
  import FileNameCell from "./file-name-cell.svelte"
  import Input from "../ui/input/input.svelte"
  import * as Table from "$lib/components/ui/table"
  import FlexRender from "../ui/data-table/flex-render.svelte"
  import * as Empty from "$lib/components/ui/empty/index.js"
  import FolderX from "@lucide/svelte/icons/folder-x"
  import Button from "../ui/button/button.svelte"
  import FolderPlus from "@lucide/svelte/icons/folder-plus"
  import MoveUpLeft from "@lucide/svelte/icons/move-up-left"
  import { cn } from "$lib/utils"
  import Breadcrumbs from "./breadcrumbs.svelte"

  let { class: className }: { class?: string } = $props()

  const files = useFiles()
  const tableData = $derived(files.data)
  const columns: ColumnDef<FileInfo>[] = [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(DataTableCheckbox, {
          checked: table.getIsAllPageRowsSelected(),
          indeterminate:
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected(),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all"
        }),
      cell: ({ row }) =>
        renderComponent(DataTableCheckbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row"
        }),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => {
        const file = row.original
        return renderComponent(FileNameCell, {
          name: file.name,
          isDir: file.isDir,
          onclick: () => {
            const currentPath = route.pathname.replace(/\/$/, "")
            navigate(`${currentPath}/${file.name}`)
          }
        })
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
      header: "修改时间"
    }
  ]

  let rowSelection = $state<RowSelectionState>({})
  let columnFilters = $state<ColumnFiltersState>([])

  const table = createSvelteTable({
    get data() {
      return tableData
    },
    columns,
    state: {
      get rowSelection() {
        return rowSelection
      },
      get columnFilters() {
        return columnFilters
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters)
      } else {
        columnFilters = updater
      }
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection)
      } else {
        rowSelection = updater
      }
    }
  })
</script>

<div class={cn("flex-1 flex flex-col overflow-hidden w-full mb-4", className)}>
  <div class="flex items-center py-2 justify-between shrink-0">
    <Breadcrumbs />
    <Input
      placeholder="输入文件名称过滤..."
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      oninput={(e) =>
        table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
      onchange={(e) => {
        table.getColumn("name")?.setFilterValue(e.currentTarget.value)
      }}
      class="max-w-xs"
    />
  </div>
  <div class="flex-1 overflow-auto rounded-md border">
    <Table.Root>
      <Table.Header class="sticky bg-gray-50">
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class="[&:has([role=checkbox])]:ps-3">
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && "selected"}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="[&:has([role=checkbox])]:ps-3">
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              <Empty.Root>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <FolderX />
                  </Empty.Media>
                  <Empty.Title>无文件</Empty.Title>
                  <Empty.Description>
                    该目录下没有文件，点击下方按钮创建文件夹或返回上一级目录
                  </Empty.Description>
                </Empty.Header>
                <Empty.Content>
                  <div class="flex gap-2">
                    <Button><FolderPlus />新建文件夹</Button>
                    <Button variant="outline" onclick={() => navigate(-1)}
                      ><MoveUpLeft />返回上一级</Button
                    >
                  </div>
                </Empty.Content>
              </Empty.Root>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
