import { createRouter } from "sv-router"

const router = createRouter({
  "/": {
    "/": () => import("src/pages/layout.svelte"),
    hooks: {
      beforeLoad() {
        throw navigate("/home", { replace: true })
      }
    }
  },
  "*": () => import("src/pages/layout.svelte")
})

export const { p, route } = router
// 导出可以接受任意路径的 navigate 函数
export function navigate(
  path: string | number,
  options?: { replace?: boolean }
) {
  return (router.navigate as any)(path, options)
}
