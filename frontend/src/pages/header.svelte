<script lang="ts">
  import FileHandle from "$lib/components/header/fileHandle.svelte"
  import FileNavigate from "$lib/components/header/fileNavigate.svelte"
</script>

<header class="flex p-4 items-center justify-between">
  <FileNavigate />
  <FileHandle />
</header>
