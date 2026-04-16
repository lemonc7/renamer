<template>
  <UApp
    :toaster="{
      duration: 2000,
      position: 'top-center'
    }"
  >
    <!-- 外部容器 -->
    <div
      class="h-screen flex flex-col bg-neutral-200 dark:bg-neutral-800 p-4 overflow-hidden"
    >
      <!-- 圆角容器 -->
      <div
        class="flex-1 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
      >
        <AppHeader />
        <main class="flex-1 p-4 min-h-0">
          <RouterView />
        </main>
      </div>
    </div>
  </UApp>
</template>
