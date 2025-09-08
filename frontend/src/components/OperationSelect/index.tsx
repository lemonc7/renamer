import React, { useState } from "react"
import { OperationMode } from "../../models"
import { Button, Select } from "antd"
import { CheckOutlined } from "@ant-design/icons"

const { Option } = Select

const OperationSelect: React.FC = () => {
  const [mode, setMode] = useState<OperationMode>(OperationMode.Rename)

  const options = Object.values(OperationMode).map((mode) => (
    <Option key={mode} value={mode}>
      {mode}
    </Option>
  ))

  return (
    <div style={{ marginLeft: 50, display: "flex", alignItems: "center" }}>
      <Select
        value={mode}
        onChange={(value: OperationMode) => setMode(value)}
        style={{ width: 160 }}
      >
        {options}
      </Select>
      <Button icon={<CheckOutlined />} style={{ marginLeft: 10 }}>
        确认
      </Button>
    </div>
  )
}

export default OperationSelect
