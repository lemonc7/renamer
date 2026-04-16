<template>
  <UBreadcrumb :items="items">
    <template #dropdown="{ item }: { item: BreadcrumbItem }">
      <UDropdownMenu :items="item.children ?? []">
        <UButton :icon="item.icon" variant="link" class="p-0.5" />
      </UDropdownMenu>
    </template>
    <template #item="{ item }">
      <UTooltip :text="item.label" :delay-duration="100">
        <span class="max-w-30 truncate">
          {{ item.label }}
        </span>
      </UTooltip>
    </template>
  </UBreadcrumb>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui"
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const items = computed(() => {
  const segments = Array.isArray(route.params.pathMatch)
    ? route.params.pathMatch
    : route.path.split("/").filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = []
  const getPath = (index: number) =>
    `/${segments.slice(0, index + 1).join("/")}`

  if (segments.length <= 5) {
    segments.forEach((seg, i) => {
      breadcrumbs.push({
        label: seg,
        to: getPath(i)
      })
    })
  } else {
    // 添加第一个元素
    breadcrumbs.push({
      label: segments[0],
      to: getPath(0)
    })

    // 添加中间元素
    breadcrumbs.push({
      slot: "dropdown" as const,
      icon: "i-lucide-ellipsis",
      children: segments.slice(1, -3).map((seg, i) => ({
        label: seg,
        to: getPath(i + 1)
      }))
    })

    // 添加最后三个元素
    segments.slice(-3).forEach((seg, i) => {
      breadcrumbs.push({
        label: seg,
        to: getPath(segments.length - 3 + i)
      })
    })
  }

  return breadcrumbs
})
</script>
