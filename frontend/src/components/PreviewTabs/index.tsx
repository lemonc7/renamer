import { Table, Tabs, type TableColumnsType, type TabsProps } from "antd"
import React from "react"
import { usePreviewRename } from "../../stores/usePreviewRename"
import type { Names } from "../../models"

const PreviewTables: React.FC<{ names: Names[] }> = ({ names }) => {
  const columns: TableColumnsType<Names> = [
    {
      title: "原名称",
      dataIndex: "oldName"
    },
    {
      title: "新名称",
      dataIndex: "newName"
    }
  ]

  return (
    <Table<Names> columns={columns} dataSource={names} rowKey={"oldName"} />
  )
}

const PreviewTabs: React.FC = () => {
  const nameMaps = usePreviewRename((state) => state.nameMaps)
  const items: TabsProps["items"] = nameMaps.map((item) => {
    return {
      key: item.dirName,
      label: item.dirName,
      children: <PreviewTables names={item.filesName ?? []} />
    }
  })
  return (
    <div>
      <Tabs items={items} />
    </div>
  )
}

export default PreviewTabs
