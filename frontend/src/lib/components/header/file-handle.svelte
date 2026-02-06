<script lang="ts">
  import Button, { buttonVariants } from "../ui/button/button.svelte"
  import FolderPlus from "@lucide/svelte/icons/folder-plus"
  import Menu from "@lucide/svelte/icons/menu"
  import Trash2 from "@lucide/svelte/icons/trash-2"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
  import type { FileInfo } from "src/model"

  let { selectedFiles }: { selectedFiles: FileInfo[] } = $props()
</script>

<div class="flex items-center justify-between gap-2">
  {#if selectedFiles.length > 0}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
        <Menu />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>操作</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>移动</DropdownMenu.Item>
        <DropdownMenu.Item>复制</DropdownMenu.Item>
        <DropdownMenu.Item class="text-red-500"
          ><Trash2 color="red" />删除</DropdownMenu.Item
        >
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}
  <Button title="新建文件夹"><FolderPlus /> 新建</Button
  >
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class={buttonVariants({ variant: "outline" })}
      title="批量整理"
      disabled={!selectedFiles.some((file) => file.isDir)}
    >
      <Menu /> 整理
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Label>操作</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>剧集重命名</DropdownMenu.Item>
      <DropdownMenu.Item>整理剧集</DropdownMenu.Item>
      <DropdownMenu.Item>移除文本</DropdownMenu.Item>
      <DropdownMenu.Item>替换中文</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
