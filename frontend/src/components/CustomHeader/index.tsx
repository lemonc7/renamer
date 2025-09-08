import React from "react"
import { Header } from "antd/es/layout/layout"
import OperationSelect from "../OperationSelect"
import FileNavigate from "../FileNavigate"
import FileHandle from "../FileHandle"

const CustomHeader: React.FC = () => {
  return (
    <Header style={{ display: "flex", alignItems: "center", backgroundColor: "gray" }}>
      <div style={{ flex: 1, textAlign: "left" }}>
        <FileNavigate />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <OperationSelect />
      </div>
      <div style={{ flex: 1, textAlign: "right" }}>
        <FileHandle />
      </div>
    </Header>
  )
}

export default CustomHeader
