<script lang="ts">
  import { navigate, route } from "src/router"
  import * as Breadcrumb from "$lib/components/ui/breadcrumb"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"

  const MAX_VISIBLE = 3 // 最多显示的层级数量

  // 面包屑元素
  let allItems = $derived.by(() => {
    const relativePath = route.pathname
      .replace(/^\/home/, "")
      .replace(/^\//, "")
    const segments = relativePath.split("/").filter(Boolean)
    return segments.map((seg, idx) => {
      const url = "/home/" + segments.slice(0, idx + 1).join("/")
      return {
        label: decodeURIComponent(seg),
        url,
        isLast: idx === segments.length - 1
      }
    })
  })

  // 折叠菜单中的元素
  let collapsedItems = $derived(
    allItems.length > MAX_VISIBLE
      ? allItems.slice(0, allItems.length - MAX_VISIBLE)
      : []
  )
  // 最终显示的项
  let visibleItems = $derived(
    allItems.length > MAX_VISIBLE
      ? allItems.slice(allItems.length - MAX_VISIBLE)
      : allItems
  )
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/home">home</Breadcrumb.Link>
    </Breadcrumb.Item>
    {#if allItems.length > 0}
      <Breadcrumb.Separator />
    {/if}
    {#if collapsedItems.length > 0}
      <Breadcrumb.Item>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="flex items-center gap-1">
            <Breadcrumb.Ellipsis class="size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {#each collapsedItems as item}
              <DropdownMenu.Item onSelect={() => navigate(item.url)}>
                {item.label}
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
    {/if}

    {#each visibleItems as item}
      <Breadcrumb.Item>
        {#if item.isLast}
          <Breadcrumb.Page>{item.label}</Breadcrumb.Page>
        {:else}
          <Breadcrumb.Link href={item.url}>
            {item.label}
          </Breadcrumb.Link>
        {/if}
      </Breadcrumb.Item>

      {#if !item.isLast}
        <Breadcrumb.Separator />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
