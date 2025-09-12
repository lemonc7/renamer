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
import { OperationMode, type Names } from "../../models"
import { ReloadOutlined } from "@ant-design/icons"
import { updateEpisode } from "../../utils/updateEpisode"
import { useMessageApi } from "../../utils/useMessageApi"

const PreviewTables: React.FC<{ names: Names[] }> = ({ names }) => {
  const columns: TableColumnsType<Names> = [
    {
      title: "原名称",
      dataIndex: "oldName",
      width: "60%",
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft" mouseEnterDelay={1}>
          <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
            {text}
          </span>
        </Tooltip>
      )
    },
    {
      title: "新名称",
      dataIndex: "newName",
      width: "40%",
      render: (text: string) => (
        <Tooltip title={text} placement="topRight" mouseEnterDelay={1}>
          <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
            {text}
          </span>
        </Tooltip>
      )
    }
  ]

  return (
    <div className="max-h-[66vh] overflow-auto">
      <Table<Names>
        columns={columns}
        dataSource={names}
        rowKey={"oldName"}
        pagination={false}
        sticky
      />
    </div>
  )
}

const PreviewTabs: React.FC<{
  mode: OperationMode
  offsets: Record<string, number>
  setOffsets: React.Dispatch<React.SetStateAction<Record<string, number>>>
}> = ({ mode, offsets, setOffsets }) => {
  const { nameMaps, setNameMaps } = usePreviewRename()
  const cacheNames = React.useRef<Record<string, string[]>>({})
  const messageApi = useMessageApi()

  if (Object.keys(cacheNames.current).length === 0) {
    nameMaps.forEach((item) => {
      cacheNames.current[item.dirName] =
        item.filesName?.map((file) => file.newName) ?? []
    })
  }

  const updateOffset = (dirName: string, value: number | string | null) => {
    if (typeof value !== "number" || !Number.isInteger(value)) return
    setOffsets((prev) => ({ ...prev, [dirName]: value }))
  }

  const handleUpdate = (dirName: string) => {
    const offset = offsets[dirName] || 0
    try {
      setNameMaps((prev) =>
        prev.map((item) => {
          if (item.dirName !== dirName) return item

          const updatedFiles = item.filesName?.map((file, index) => {
            const baseName =
              cacheNames.current[dirName]?.[index] ?? file.newName
            return {
              ...file,
              newName: updateEpisode(baseName, offset)
            }
          })

          return {
            ...item,
            filesName: updatedFiles
          }
        })
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.open({
        type: "error",
        content: msg
      })
      console.error(msg)
    }
  }

  const items: TabsProps["items"] = nameMaps.map((item) => ({
    key: item.dirName,
    label: item.dirName,
    children: (
      <div>
        {mode === OperationMode.Rename && (
          <div className="flex items-center mb-2.5">
            <Tooltip title="集数偏移">
              <InputNumber
                value={offsets[item.dirName] ?? 0}
                changeOnWheel
                precision={0}
                step={1}
                onChange={(value) => updateOffset(item.dirName, value)}
              />
            </Tooltip>
            <Button
              className="ml-4"
              icon={<ReloadOutlined />}
              onClick={() => handleUpdate(item.dirName)}
            >
              更新
            </Button>
          </div>
        )}

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
