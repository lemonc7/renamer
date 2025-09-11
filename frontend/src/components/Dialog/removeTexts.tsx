import { Input, type InputRef, message, Modal } from "antd"
import React from "react"
import { removeTextsPreview } from "../../api/api"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"
import Preview from "./preview"
import { OperationMode } from "../../models"

const RemoveTexts: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const [inputValue, setInputValue] = React.useState("")
  const [messageApi, contextHolder] = message.useMessage()
  const inputRef = React.useRef<InputRef>(null)
  const location = useLocation()
  const [showPreview, setShowPreview] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const extractTexts = () => {
    const texts = inputValue
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    return Array.from(new Set(texts))
  }

  const handleOK = async () => {
    if (!inputValue.trim() || inputValue.includes("/")) {
      messageApi.open({
        type: "error",
        content: "输入的内容不能为空或包含 /"
      })
      return
    }

    try {
      await removeTextsPreview(joinPath(location.pathname, []), extractTexts())
      onClose()
      setInputValue("")
      setShowPreview(true)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.open({
        type: "error",
        content: msg
      })
      console.error(msg)
    }
  }

  const handleCancel = () => {
    onClose()
    setInputValue("")
    setShowPreview(false)
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="移除文本"
        centered
        open={open}
        onCancel={handleCancel}
        onOk={handleOK}
        okText="确认"
        cancelText="取消"
      >
        <Input
          value={inputValue}
          ref={inputRef}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="请输入要移除的文本,多个用空格分隔"
          allowClear
        />
      </Modal>
      <Preview
        open={showPreview}
        onClose={handleCancel}
        mode={OperationMode.RemoveTexts}
      />
    </>
  )
}

export default RemoveTexts
