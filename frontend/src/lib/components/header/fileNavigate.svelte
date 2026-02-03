<script lang="ts">
  import Button from "../ui/button/button.svelte"
  import House from "@lucide/svelte/icons/house"
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw"
  import ChevronLeft from "@lucide/svelte/icons/chevron-left"
  import ChevronRight from "@lucide/svelte/icons/chevron-right"
  import { useFiles } from "src/hook/useFiles.svelte"
  import * as ButtonGroup from "$lib/components/ui/button-group"
  import { navigate } from "src/router"
  import { toast } from "svelte-sonner"

  const files = useFiles()
</script>

<div class="flex items-center justify-between gap-2">
  <Button variant="outline" title="返回主页" onclick={() => navigate("/home")}>
    <House /> 主页
  </Button>
  <Button
    variant="outline"
    title="刷新数据"
    onclick={() => {
      toast.promise(files.refetch, {
        loading: "刷新文件信息...",
        success: "刷新成功",
        error: (err) => {
          if (err instanceof Error) return `刷新失败: ${err.message}`
          return "刷新失败"
        }
      })
    }}
  >
    <RotateCcw /> 刷新
  </Button>
  <ButtonGroup.Root>
    <Button
      variant="outline"
      class="w-12"
      title="后退"
      onclick={() => navigate(-1)}
    >
      <ChevronLeft />
    </Button>
    <Button
      variant="outline"
      class="w-12"
      title="前进"
      onclick={() => navigate(1)}
    >
      <ChevronRight />
    </Button>
  </ButtonGroup.Root>
</div>
