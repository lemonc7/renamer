import { message, Modal } from "antd"
import React from "react"
import { useLocation } from "react-router"
import { useRefresh } from "../../stores/useRefresh"
import { useSavedFilesStore } from "../../stores/useSavedFiles"
import { InfoCircleOutlined } from "@ant-design/icons"
import { copyFiles, moveFiles } from "../../api/api"
import { joinPath } from "../../utils/path"

const PasteFiles: React.FC<{
  open: boolean
  pasteType: "copy" | "cut"
  onClose: () => void
}> = ({ open, pasteType, onClose }) => {
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const refresh = useRefresh((state) => state.setRefreshKey)
  const setSavedFiles = useSavedFilesStore((state) => state.setSavedFiles)

  let title = ""
  if (pasteType === "copy") {
    title = "复制"
  } else if (pasteType === "cut") {
    title = "剪切"
  }

  const handleOK = async () => {
    try {
      const targetPath = joinPath(location.pathname, [])
      if (pasteType === "copy") {
        await copyFiles(targetPath)
        messageApi.success("复制成功")
      } else if (pasteType === "cut") {
        await moveFiles(targetPath)
        messageApi.success("剪切成功")
      }
      onClose()
      refresh()
      setSavedFiles([])
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error(msg)
      console.error(msg)
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={`${title}文件`}
        centered
        open={open}
        onCancel={onClose}
        onOk={handleOK}
        okText="确定"
        cancelText="取消"
      >
        <InfoCircleOutlined style={{ marginRight: 8, color: "orange" }} />
        {`${title}文件将覆盖原文件,是否继续?`}
      </Modal>
    </>
  )
}

export default PasteFiles
