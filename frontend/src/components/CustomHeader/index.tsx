import React from "react"
import OperationSelect from "../OperationSelect"
import FileNavigate from "../FileNavigate"
import ButtonGroups from "../FileHandle/buttonGroups"
import CreateDirButton from "../FileHandle/createDirButton"

const CustomHeader: React.FC = () => {
  return (
    <div
      className={
        "relative flex items-center bg-gray-500 h-16 px-4 sm:px-6 md:px-8"
      }
    >
      <div className="flex items-center">
        <FileNavigate />
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <OperationSelect />
      </div>
      <div className="flex justify-end gap-2 ml-auto">
        <CreateDirButton />
        <ButtonGroups />
      </div>
    </div>
  )
}

export default CustomHeader
