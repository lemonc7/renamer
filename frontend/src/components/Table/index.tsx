import React from "react"
import { useFileListStore } from "../../stores/useFileList"

const Table: React.FC = () => {
  const fileList = useFileListStore((state) => state.fileList)
  console.log(fileList)

  return (
    <div>
      {fileList.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </div>
  )
}

export default Table
