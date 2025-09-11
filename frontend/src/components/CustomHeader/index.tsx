import React from "react"
import OperationSelect from "../OperationSelect"
import FileNavigate from "../FileNavigate"
import FileHandle from "../FileHandle"

const CustomHeader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`
        flex items-center bg-gray-500 h-16 px-4 ${
          className || ""
        } sm:px-6 md:px-8
        `}
    >
      <div className="flex-1 text-left">
        <FileNavigate />
      </div>
      <div className="flex-1 text-center">
        <OperationSelect />
      </div>
      <div className="flex-1 text-right">
        <FileHandle />
      </div>
    </div>
  )
}

export default CustomHeader
