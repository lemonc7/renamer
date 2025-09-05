import { createBrowserRouter, redirect } from "react-router"
import CustomLayout from "../pages/Layout"

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
    Component: CustomLayout
  }
])

export default router
