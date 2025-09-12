import { Button, Space, Tooltip } from "antd"
import React from "react"
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ScissorOutlined,
  CarryOutOutlined,
  SettingOutlined
} from "@ant-design/icons"
import DeleteFiles from "../Dialog/deleteFiles"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import RenameFile from "../Dialog/renameFile"
import PasteFiles from "../Dialog/pasteFiles"
import { useSavedFilesStore } from "../../stores/useSavedFiles"
import { useSavedPath } from "../../stores/useSavedPath"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"
import { useMessageApi } from "../../utils/useMessageApi"

const ButtonGroups: React.FC = () => {
  const [showDeleteFilesDialog, setDeleteFilesDialog] = React.useState(false)
  const [showRenameFileDialog, setRenameFileDialog] = React.useState(false)
  const [showPasteDialog, setPasteDialog] = React.useState(false)
  const selectedFiles = useSelectedFilesStore((state) => state.selectedFiles)
  const { savedFiles, setSavedFiles } = useSavedFilesStore()
  const setSavedPath = useSavedPath((state) => state.setSavedPath)
  const location = useLocation()
  const [pasteType, setPasteType] = React.useState<"copy" | "cut">("copy")
  const messageApi = useMessageApi()

  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen(!open)

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
      <PasteFiles
        open={showPasteDialog}
        onClose={() => setPasteDialog(false)}
        pasteType={pasteType}
      />
      <div className="hidden sm:flex items-center justify-end w-full space-x-2 ">
        <div>
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
                icon={<CarryOutOutlined />}
                onClick={() => setPasteDialog(true)}
                disabled={savedFiles.length === 0}
              />
            </Tooltip>
          </Space.Compact>
        </div>
      </div>
      <div className="fixed bottom-12 right-4 flex flex-col items-center gap-4 sm:hidden">
        {/* 子功能按钮 */}
        {open && (
          <Space direction="vertical">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              size="large"
              onClick={() => setRenameFileDialog(true)}
              disabled={selectedFiles.length !== 1}
              className="disabled-button"
            />
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              size="large"
              onClick={() => setDeleteFilesDialog(true)}
              disabled={selectedFiles.length === 0}
              className="disabled-button"
            />
            <Button
              shape="circle"
              icon={<CopyOutlined />}
              size="large"
              onClick={() => handleSaveSelectedFiles("copy")}
              disabled={selectedFiles.length === 0}
              className="disabled-button"
            />
            <Button
              shape="circle"
              icon={<ScissorOutlined />}
              size="large"
              onClick={() => handleSaveSelectedFiles("cut")}
              disabled={selectedFiles.length === 0}
              className="disabled-button"
            />
            <Button
              shape="circle"
              icon={<CarryOutOutlined />}
              size="large"
              onClick={() => setPasteDialog(true)}
              disabled={savedFiles.length === 0}
              className="disabled-button"
            />
          </Space>
        )}

        {/* 主按钮 */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<SettingOutlined />}
          onClick={toggle}
        />
      </div>
    </>
  )
}

export default ButtonGroups
