import React from "react"
import { useLocation, useNavigate } from "react-router"
import { Dropdown, type MenuProps } from "antd"

const MAX_BREADCRUMB_ITEMS = 4

const CustomBreadcrumb: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const pathSnippets = location.pathname
    .split("/")
    .filter(Boolean)
    .map((i) => decodeURIComponent(i))

  const allItems = pathSnippets.map((segment, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`
    const isLast = index === pathSnippets.length - 1
    return {
      key: url,
      label: segment,
      isLast,
      url
    }
  })

  const renderItem = (item: (typeof allItems)[0]) => (
    <span
      key={item.key}
      className={`${item.isLast ? "breadcrumb-item-last" : "breadcrumb-item"}`}
      onClick={() => !item.isLast && navigate(item.url)}
    >
      {item.label}
    </span>
  )

  // 判断是否手机端
  const isMobile = window.innerWidth < 640

  let itemsToRender: React.ReactNode[] = []

  if (!isMobile) {
    // PC / 平板端逻辑
    if (allItems.length <= MAX_BREADCRUMB_ITEMS) {
      itemsToRender = allItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {renderItem(item)}
          {index !== allItems.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </React.Fragment>
      ))
    } else {
      const dropdownItems: MenuProps["items"] = allItems
        .slice(1, -3)
        .map((item) => ({
          key: item.key,
          label: (
            <span
              className="breadcrumb-item"
              onClick={() => navigate(item.url)}
            >
              {item.label}
            </span>
          )
        }))

      itemsToRender = [
        renderItem(allItems[0]),
        <span key="separator-0" className="breadcrumb-separator">
          /
        </span>,
        <Dropdown
          key="ellipsis"
          menu={{ items: dropdownItems }}
          trigger={["hover"]}
        >
          <span className="breadcrumb-item">. . .</span>
        </Dropdown>,
        <span key="separator-ellipsis" className="breadcrumb-separator">
          /
        </span>,
        ...allItems.slice(-3).map((item, index) => (
          <React.Fragment key={item.key}>
            {renderItem(item)}
            {index !== 2 && <span className="breadcrumb-separator">/</span>}
          </React.Fragment>
        ))
      ]
    }
  } else {
    // 手机端逻辑，只显示最后两项
    if (allItems.length > 2) {
      const dropdownItems: MenuProps["items"] = allItems
        .slice(0, -2)
        .map((item) => ({
          key: item.key,
          label: (
            <span
              className="breadcrumb-item"
              onClick={() => navigate(item.url)}
            >
              {item.label}
            </span>
          )
        }))

      itemsToRender = [
        <Dropdown
          key="ellipsis-mobile"
          menu={{ items: dropdownItems }}
          trigger={["hover"]}
        >
          <span className="breadcrumb-item">. . .</span>
        </Dropdown>,
        <span key="separator-mobile" className="breadcrumb-separator">
          /
        </span>,
        renderItem(allItems[allItems.length - 2]),
        <span key="separator-last" className="breadcrumb-separator">
          /
        </span>,
        renderItem(allItems[allItems.length - 1])
      ]
    } else {
      itemsToRender = allItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {renderItem(item)}
          {index !== allItems.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </React.Fragment>
      ))
    }
  }

  return (
    <div className="text-base flex flex-wrap items-center">{itemsToRender}</div>
  )
}

export default CustomBreadcrumb
