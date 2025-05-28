import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/:path(.*)",
    component: () => import("../components/Home.vue")
  },
  {
    path: "/",
    redirect: "/vol2/1000/share/downloads"
  },
  {
    path: "/ping",
    component: {
      render() {
        return "pong"
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
