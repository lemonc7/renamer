import { Button, message, Space } from "antd"
import React from "react"
import {
  HomeOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined
} from "@ant-design/icons"
import { useNavigate } from "react-router"
import { useRefresh } from "../../stores/useRefresh"

const FileNavigate: React.FC = () => {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const refresh = useRefresh((state) => state.setRefreshKey)

  return (
    <div>
      {contextHolder}
      <Button icon={<HomeOutlined />} onClick={() => navigate("/home")}>
        主页
      </Button>
      <Button
        onClick={() => {
          refresh()
          messageApi.success({
            content: "刷新成功"
          })
        }}
        icon={<ReloadOutlined />}
        style={{ marginLeft: 10 }}
      >
        刷新
      </Button>
      <Space.Compact style={{ marginLeft: 20 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
          后退
        </Button>
        <Button icon={<RightOutlined />} onClick={() => navigate(1)}>
          前进
        </Button>
      </Space.Compact>
    </div>
  )
}

export default FileNavigate
