import React from "react"
import { useFileListStore } from "../../stores/useFileList"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { Footer } from "antd/es/layout/layout"

const CustomFooter: React.FC = () => {
  const fileList = useFileListStore((state) => state.fileList)
  const selectedFiles = useSelectedFilesStore((state) => state.selectedFiles)
  return (
    <Footer style={{ textAlign: "center" }}>
      选中 <b>{selectedFiles.length}</b> / {fileList.length} 个文件
    </Footer>
  )
}

export default CustomFooter
