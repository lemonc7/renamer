<script lang="ts">
  import FileHandle from "$lib/components/header/file-handle.svelte"
  import FileNavigate from "$lib/components/header/file-navigate.svelte"
  import type { FileInfo } from "src/model"

  let selectedFiles = $state<FileInfo[]>([])
</script>

<header class="flex p-4 items-center justify-between">
  <FileNavigate />
  <FileHandle {selectedFiles} />
</header>
