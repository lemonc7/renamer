import { useLocation, useNavigate } from "react-router"
import { Breadcrumb as AntdBreadcrumb } from "antd"
import type React from "react"

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const pathSnippets = location.pathname.split("/").filter((i) => i)
  const items = pathSnippets.map((segment, index) => {
    const url = "/" + pathSnippets.slice(0, index + 1).join("/")
    return {
      title: (
        <span style={{ cursor: "pointer" }} onClick={() => navigate(url)}>
          {segment}
        </span>
      ),
      key: url
    }
  })
  return <AntdBreadcrumb style={{ margin: "16px 0" }} items={items} />
}

export default Breadcrumb
