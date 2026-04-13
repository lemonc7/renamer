<template>
  <!-- 外部容器 -->
  <div class="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900 p-4 overflow-hidden">
    <!-- 圆角容器 -->
    <div class="flex-1 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
      
      <header class="h-14 shrink-0 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-2">
          <UIcon name="i-logos-nuxt-icon" class="size-6" />
          <span class="font-bold text-sm">我的系统</span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4">
        <RouterView />
      </main>
      
    </div>
  </div>
</template>