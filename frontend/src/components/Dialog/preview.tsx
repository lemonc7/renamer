import { message, Modal } from "antd"
import React from "react"
import { useLocation } from "react-router"
import { OperationMode } from "../../models"
import { renameFiles } from "../../api/api"
import { joinPath } from "../../utils/path"
import PreviewTabs from "../PreviewTabs"
import { usePreviewRename } from "../../stores/usePreviewRename"
import { useRefresh } from "../../stores/useRefresh"

const Preview: React.FC<{
  open: boolean
  onClose: () => void
  mode: OperationMode
}> = ({ open, onClose, mode }) => {
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const nameMaps = usePreviewRename((state) => state.nameMaps)
  const refresh = useRefresh((state) => state.setRefreshKey)

  const handleRename = async () => {
    try {
      await renameFiles(joinPath(location.pathname, []), nameMaps)
      refresh()
      messageApi.success(`${mode}成功`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error({
        content: msg
      })
      console.error(msg)
    } finally {
      onClose()
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={`${mode}预览`}
        centered
        open={open}
        onOk={handleRename}
        onCancel={onClose}
        okText="确认"
        cancelText="取消"
      >
        <PreviewTabs />
      </Modal>
    </>
  )
}

export default Preview
