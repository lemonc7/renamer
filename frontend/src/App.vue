<template>
  <UApp
    :toaster="{
      duration: 2000,
      position: 'top-center'
    }"
  >
    <!-- 外部容器 -->
    <div
      class="h-screen flex flex-col bg-muted p-4 overflow-hidden"
    >
      <!-- 圆角容器 -->
      <div
        class="flex-1 flex flex-col overflow-hidden rounded-xl bg-default shadow-sm ring-1 ring-default"
      >
        <AppHeader />
        <main class="flex-1 p-4 min-h-0">
          <RouterView />
        </main>
      </div>
    </div>
  </UApp>
</template>
