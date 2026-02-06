<script lang="ts">
  import { Toaster } from "svelte-sonner"
  import Header from "./header.svelte"
  import Main from "./main.svelte"
</script>

<Toaster position="top-center" duration={1000} closeButton />
<!-- 外层容器，占满全屏 -->
<div class="h-screen w-full bg-gray-200 flex overflow-hidden">
  <!-- 内层圆角容器，占满外层空间 -->
  <div
    class="flex flex-col flex-1 rounded-lg bg-white shadow-lg overflow-hidden m-2"
  >
    <Header />
    <Main />
  </div>
</div>
