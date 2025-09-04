import { createBrowserRouter, redirect } from "react-router"
import Layout from "../pages/Layout"

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/home")
  },
  {
    path: "/ping",
    Component: () => <div>pong</div>
  },
  {
    path: "/*",
    Component: Layout
  }
])

export default router
