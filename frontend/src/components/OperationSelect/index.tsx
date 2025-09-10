import React, { useState } from "react"
import { OperationMode } from "../../models"
import { Button, message, Select } from "antd"
import { CheckOutlined } from "@ant-design/icons"
import TidySeries from "../Dialog/tidySeries"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import Preview from "../Dialog/preview"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"
import { renamePreview, replaceChinesePreview } from "../../api/api"
import RemoveTexts from "../Dialog/removeTexts"

const { Option } = Select

const OperationSelect: React.FC = () => {
  const [mode, setMode] = useState<OperationMode>(OperationMode.Rename)
  const [showDialog, setShowDialog] = useState(false)
  const selectedFiles = useSelectedFilesStore((state) => state.selectedFiles)
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()

  let DialogComponent = null
  switch (mode) {
    case OperationMode.Rename:
    case OperationMode.ReplaceChinese:
      DialogComponent = (
        <Preview
          onClose={() => setShowDialog(false)}
          open={showDialog}
          mode={mode}
        />
      )
      break
    case OperationMode.TidySeries:
      DialogComponent = (
        <TidySeries open={showDialog} onClose={() => setShowDialog(false)} />
      )
      break
    case OperationMode.RemoveTexts:
      DialogComponent = (
        <RemoveTexts open={showDialog} onClose={() => setShowDialog(false)} />
      )
      break
  }

  const handleButton = async () => {
    const path = joinPath(location.pathname, [])
    try {
      switch (mode) {
        case OperationMode.Rename:
          await renamePreview(path)
          break
        case OperationMode.ReplaceChinese:
          await replaceChinesePreview(path)
          break
      }
      setShowDialog(true)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error({
        content: msg
      })
      console.error(error)
    }
  }

  const options = Object.values(OperationMode).map((mode) => (
    <Option key={mode} value={mode}>
      {mode}
    </Option>
  ))

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Select
          value={mode}
          onChange={(value: OperationMode) => setMode(value)}
          style={{ width: 160 }}
        >
          {options}
        </Select>
        <Button
          className="custom-disabled-button"
          icon={<CheckOutlined />}
          style={{ marginLeft: 10 }}
          onClick={handleButton}
          disabled={selectedFiles.filter((item) => item.isDir).length === 0}
        >
          确认
        </Button>
        {DialogComponent}
      </div>
    </>
  )
}

export default OperationSelect
