import { useLocation, useNavigate } from "react-router"
import { Breadcrumb, Dropdown, type MenuProps } from "antd"
import type React from "react"
import "./index.css"

const MAX_BREADCRUMB_ITEMS = 4

const CustomBreadcrumb: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const breadItems = () => {
    const pathSnippets = location.pathname
      .split("/")
      .filter(Boolean)
      .map((i) => decodeURIComponent(i))

    const allItems = pathSnippets.map((segment, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`
      const isLast = index === pathSnippets.length - 1
      return {
        key: url,
        title: (
          <span
            className={`breadcrumb-item ${isLast ? "last" : ""}`}
            onClick={() => !isLast && navigate(url)}
          >
            {segment}
          </span>
        ),
        label: segment
      }
    })

    if (allItems.length <= MAX_BREADCRUMB_ITEMS) {
      return allItems
    }

    const dropdownItems: MenuProps["items"] = allItems
      .slice(1, -3)
      .map((item) => ({
        key: item.key,
        label: (
          <span className="breadcrumb-item" onClick={() => navigate(item.key)}>
            {item.label}
          </span>
        )
      }))

    return [
      allItems[0],
      {
        key: "ellipsis",
        title: (
          <Dropdown
            menu={{
              items: dropdownItems
            }}
            trigger={["hover"]}
          >
            <span className="breadcrumb-item">. . .</span>
          </Dropdown>
        )
      },
      ...allItems.slice(-3)
    ]
  }
  return <Breadcrumb style={{ fontSize: "16px" }} items={breadItems()} />
}

export default CustomBreadcrumb
