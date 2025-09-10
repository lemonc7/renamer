import { Button, Divider, message, Space, Tooltip } from "antd"
import React, { useState } from "react"
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  ScissorOutlined,
  SnippetsOutlined
} from "@ant-design/icons"
import CreateDir from "../Dialog/createDir"
import DeleteFiles from "../Dialog/deleteFiles"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import "./index.css"
import RenameFile from "../Dialog/renameFile"
import PasteFiles from "../Dialog/pasteFiles"
import { useSavedFilesStore } from "../../stores/useSavedFiles"
import { useSavedPath } from "../../stores/useSavedPath"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"

const FileHandle: React.FC = () => {
  const [showCreateDirDialog, setShowCreateDirDialog] = useState(false)
  const [showDeleteFilesDialog, setDeleteFilesDialog] = useState(false)
  const [showRenameFileDialog, setRenameFileDialog] = useState(false)
  const [showPasteDialog, setPasteDialog] = useState(false)
  const selectedFiles = useSelectedFilesStore((state) => state.selectedFiles)
  const { savedFiles, setSavedFiles } = useSavedFilesStore()
  const setSavedPath = useSavedPath((state) => state.setSavedPath)
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const [pasteType, setPasteType] = useState<"copy" | "cut">("copy")

  const handleSaveSelectedFiles = (type: "copy" | "cut") => {
    try {
      setSavedFiles(selectedFiles)
      setSavedPath(joinPath(location.pathname, []))
      setPasteType(type)
      if (type === "copy") {
        messageApi.success("复制成功")
      } else if (type === "cut") {
        messageApi.success("剪切成功")
      }
    } catch (error) {
      setSavedFiles([])
      setSavedPath("")
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error(msg)
      console.error(msg)
    }
  }

  return (
    <>
      {contextHolder}
      <Button
        icon={<FolderAddOutlined />}
        onClick={() => setShowCreateDirDialog(true)}
      >
        新建文件夹
      </Button>
      {/* 创建文件夹-对话框 */}
      <CreateDir
        open={showCreateDirDialog}
        onClose={() => setShowCreateDirDialog(false)}
      />
      <Divider
        type="vertical"
        style={{ height: "36px", backgroundColor: "white", margin: "0 8px" }}
      />
      <Space.Compact>
        <Tooltip title="文件重命名">
          <Button
            className="custom-disabled-button"
            icon={<EditOutlined />}
            style={{ width: 50 }}
            onClick={() => setRenameFileDialog(true)}
            disabled={selectedFiles.length !== 1}
          />
        </Tooltip>
        <Tooltip title="删除文件">
          <Button
            className="custom-disabled-button"
            icon={<DeleteOutlined />}
            style={{ width: 50 }}
            onClick={() => setDeleteFilesDialog(true)}
            disabled={selectedFiles.length === 0}
          />
        </Tooltip>
      </Space.Compact>
      {/* 重命名文件-对话框 */}
      <RenameFile
        open={showRenameFileDialog}
        onClose={() => setRenameFileDialog(false)}
      />
      {/* 删除文件-对话框 */}
      <DeleteFiles
        open={showDeleteFilesDialog}
        onClose={() => setDeleteFilesDialog(false)}
      />
      <Divider
        type="vertical"
        style={{ height: "36px", backgroundColor: "white", margin: "0 8px" }}
      />
      <Space.Compact>
        <Tooltip title="复制">
          <Button
            className="custom-disabled-button"
            icon={<CopyOutlined />}
            style={{ width: 50 }}
            onClick={() => handleSaveSelectedFiles("copy")}
            disabled={selectedFiles.length === 0}
          />
        </Tooltip>
        <Tooltip title="剪切">
          <Button
            className="custom-disabled-button"
            icon={<ScissorOutlined />}
            style={{ width: 50 }}
            onClick={() => handleSaveSelectedFiles("cut")}
            disabled={selectedFiles.length === 0}
          />
        </Tooltip>
        <Tooltip title="粘贴">
          <Button
            className="custom-disabled-button"
            icon={<SnippetsOutlined />}
            style={{ width: 50 }}
            onClick={() => setPasteDialog(true)}
            disabled={savedFiles.length === 0}
          />
        </Tooltip>
      </Space.Compact>
      <PasteFiles
        open={showPasteDialog}
        onClose={() => setPasteDialog(false)}
        pasteType={pasteType}
      />
    </>
  )
}

export default FileHandle
