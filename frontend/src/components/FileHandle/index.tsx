import { Button, message, Space, Tooltip } from "antd"
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
      <PasteFiles
        open={showPasteDialog}
        onClose={() => setPasteDialog(false)}
        pasteType={pasteType}
      />
      <div className="flex items-center justify-end w-full space-x-2">
        <Button
          icon={<FolderAddOutlined />}
          onClick={() => setShowCreateDirDialog(true)}
        >
          <span className="hidden sm:inline-block">新建文件夹</span>
        </Button>
        {/* 创建文件夹-对话框 */}
        <CreateDir
          open={showCreateDirDialog}
          onClose={() => setShowCreateDirDialog(false)}
        />
        <div className="hidden sm:inline-block">
          <Space.Compact className="mx-4">
            <Tooltip title="文件重命名">
              <Button
                className="disabled-button !w-12"
                icon={<EditOutlined />}
                onClick={() => setRenameFileDialog(true)}
                disabled={selectedFiles.length !== 1}
              />
            </Tooltip>
            <Tooltip title="删除文件">
              <Button
                className="disabled-button !w-12"
                icon={<DeleteOutlined />}
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
          <Space.Compact>
            <Tooltip title="复制">
              <Button
                className="disabled-button !w-12"
                icon={<CopyOutlined />}
                onClick={() => handleSaveSelectedFiles("copy")}
                disabled={selectedFiles.length === 0}
              />
            </Tooltip>
            <Tooltip title="剪切">
              <Button
                className="disabled-button !w-12"
                icon={<ScissorOutlined />}
                onClick={() => handleSaveSelectedFiles("cut")}
                disabled={selectedFiles.length === 0}
              />
            </Tooltip>
            <Tooltip title="粘贴">
              <Button
                className="disabled-button !w-12"
                icon={<SnippetsOutlined />}
                onClick={() => setPasteDialog(true)}
                disabled={savedFiles.length === 0}
              />
            </Tooltip>
          </Space.Compact>
        </div>
      </div>
    </>
  )
}

export default FileHandle
