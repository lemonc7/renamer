<script lang="ts">
  import { buttonVariants } from "../ui/button/button.svelte"
  import FileText from "@lucide/svelte/icons/file-text"
  import FolderOpen from "@lucide/svelte/icons/folder-open"
  import * as Tooltip from "$lib/components/ui/tooltip/index.js"
  import { cn } from "$lib/utils"

  let {
    name,
    isDir,
    onclick
  }: {
    name: string
    isDir: boolean
    onclick: () => void
  } = $props()

  const action = $derived(isDir ? { onclick } : {})
</script>

{#snippet content()}
  {#if isDir}
    <FolderOpen size={18} class="shrink-0" />
  {:else}
    <FileText size={18} class="shrink-0" />
  {/if}
  <span class="truncate">{name}</span>
{/snippet}

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger
      class={cn(
        buttonVariants({ variant: "ghost" }),
        "flex items-center gap-2 justify-start"
      )}
      disabled={!isDir}
      {...action}
    >
      {@render content()}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{name}</p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
