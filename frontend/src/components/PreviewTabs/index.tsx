import {
  Button,
  InputNumber,
  Table,
  Tabs,
  Tooltip,
  type TableColumnsType,
  type TabsProps
} from "antd"
import React from "react"
import { usePreviewRename } from "../../stores/usePreviewRename"
import type { Names } from "../../models"
import { ReloadOutlined } from "@ant-design/icons"

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
    <div>
      <Table<Names> columns={columns} dataSource={names} rowKey={"oldName"} />
    </div>
  )
}

const PreviewTabs: React.FC = () => {
  const { nameMaps, setNameMaps } = usePreviewRename()

  const updateOffset = (dirName: string, value: number | string | null) => {
    if (typeof value !== "number" || !Number.isInteger(value)) return

    setNameMaps((prev) =>
      prev.map((item) =>
        item.dirName === dirName ? { ...item, episodeOffset: value } : item
      )
    )
  }

  const items: TabsProps["items"] = nameMaps.map((item) => ({
    key: item.dirName,
    label: item.dirName,
    children: (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px"
          }}
        >
          <Tooltip title="集数偏移">
            <InputNumber
              value={item.episodeOffset}
              changeOnWheel
              precision={0}
              step={1}
              onChange={(value) => updateOffset(item.dirName, value)}
            />
          </Tooltip>
          <Button style={{ marginLeft: 10 }} icon={<ReloadOutlined />} >
            更新
          </Button>
        </div>
        <PreviewTables names={item.filesName ?? []} />
      </div>
    )
  }))
  return (
    <div>
      <Tabs items={items} />
    </div>
  )
}

export default PreviewTabs
