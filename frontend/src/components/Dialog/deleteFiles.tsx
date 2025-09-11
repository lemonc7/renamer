import { message, Modal } from "antd"
import React from "react"
import { useLocation } from "react-router"
import { deleteFiles } from "../../api/api"
import { joinPath } from "../../utils/path"
import { InfoCircleOutlined } from "@ant-design/icons"
import { useRefresh } from "../../stores/useRefresh"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"

const DeleteFiles: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const refresh = useRefresh((state) => state.setRefreshKey)
  const setSelectedFiles = useSelectedFilesStore(
    (state) => state.setSelectedFiles
  )

  const handleOK = async () => {
    try {
      await deleteFiles(joinPath(location.pathname, []))
      messageApi.success({
        content: "删除成功"
      })
      refresh()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error({
        content: msg
      })
      console.error(error)
    } finally {
      onClose()
      setSelectedFiles([])
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="删除文件"
        centered
        open={open}
        onOk={handleOK}
        onCancel={onClose}
        okText="确认"
        cancelText="取消"
      >
        <InfoCircleOutlined className="mx-2 !text-red-600" />
        确认删除所选文件么(无法撤销)？
      </Modal>
    </>
  )
}

export default DeleteFiles
