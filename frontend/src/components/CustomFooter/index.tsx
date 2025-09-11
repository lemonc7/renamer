import React from "react"
import { useFileListStore } from "../../stores/useFileList"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"

const CustomFooter: React.FC = () => {
  const fileList = useFileListStore((state) => state.fileList)
  const selectedFiles = useSelectedFilesStore((state) => state.selectedFiles)
  return (
    <div className="h-8 flex items-center justify-center text-gray-700">
      选中<b className="mx-1">{selectedFiles.length}</b>/{fileList.length}
      个文件
    </div>
  )
}

export default CustomFooter
