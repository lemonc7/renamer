import { Input, type InputRef, message, Modal } from "antd"
import React, { useEffect, useRef } from "react"
import { createDir } from "../../api/api"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"
import { useRefresh } from "../../stores/useRefresh"

const CreateDir: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const [inputValue, setInputValue] = React.useState("")
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const refresh = useRefresh((state) => state.setRefreshKey)
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleOK = async () => {
    if (!inputValue.trim()) {
      messageApi.open({
        type: "error",
        content: "文件夹名称不能为空"
      })
      return
    }

    try {
      await createDir(joinPath(location.pathname, [inputValue]))
      messageApi.open({
        type: "success",
        content: "创建成功"
      })
      onClose()
      setInputValue("")
      refresh()
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
    setInputValue("")
    onClose()
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="新建文件夹"
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
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          placeholder="请输入文件夹名称"
          allowClear
          onPressEnter={handleOK}
        />
      </Modal>
    </>
  )
}

export default CreateDir
