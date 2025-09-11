import { Button } from "antd"
import React from "react"
import { FolderAddOutlined } from "@ant-design/icons"
import CreateDir from "../Dialog/createDir"

const CreateDirButton: React.FC = () => {
  const [showCreateDirDialog, setShowCreateDirDialog] = React.useState(false)

  return (
    <>
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
    </>
  )
}

export default CreateDirButton
