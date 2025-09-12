import { Input, Modal, type InputRef } from "antd"
import React from "react"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { renameFiles } from "../../api/api"
import { joinPath } from "../../utils/path"
import { useLocation } from "react-router"
import type { NameMap } from "../../models"
import { useRefresh } from "../../stores/useRefresh"
import { useMessageApi } from "../../utils/useMessageApi"

const RenameFile: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const location = useLocation()
  const { selectedFiles, setSelectedFiles } = useSelectedFilesStore()
  const [inputValue, setInputValue] = React.useState("")
  const refresh = useRefresh((state) => state.setRefreshKey)
  const inputRef = React.useRef<InputRef>(null)
  const messageApi = useMessageApi()

  React.useEffect(() => {
    if (open && selectedFiles.length === 1) {
      setInputValue(selectedFiles[0].name)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [open, selectedFiles])

  const handleOK = async () => {
    try {
      const nameMap: NameMap[] = [
        {
          dirName: "",
          filesName: [
            {
              oldName: selectedFiles[0].name,
              newName: inputValue
            }
          ]
        }
      ]
      await renameFiles(joinPath(location.pathname, []), nameMap)
      messageApi.success("重命名成功")
      onClose()
      refresh()
      setSelectedFiles([])
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error(msg)
      console.error(msg)
    }
  }
  return (
    <>
      <Modal
        title="文件重命名"
        centered
        open={open}
        onCancel={onClose}
        onOk={handleOK}
        okText="确认"
        cancelText="取消"
      >
        <Input
          value={inputValue}
          ref={inputRef}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="请输入新文件名"
          allowClear
          onPressEnter={handleOK}
        />
      </Modal>
    </>
  )
}

export default RenameFile
