import { Button, Space } from "antd"
import React from "react"
import {
  HomeOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined
} from "@ant-design/icons"
import { useNavigate } from "react-router"
import { useRefresh } from "../../stores/useRefresh"
import { useMessageApi } from "../../utils/useMessageApi"

const FileNavigate: React.FC = () => {
  const navigate = useNavigate()
  const refresh = useRefresh((state) => state.setRefreshKey)
  const messageApi = useMessageApi()

  return (
    <div>
      <Button icon={<HomeOutlined />} onClick={() => navigate("/home")}>
        <span className="hidden sm:inline-block">主页</span>
      </Button>
      <div className="ml-2 !hidden sm:!inline-block">
        <Button
          onClick={() => {
            refresh()
            messageApi.success({
              content: "刷新成功"
            })
          }}
          icon={<ReloadOutlined />}
        >
          刷新
        </Button>
      </div>

      <div className="ml-4 hidden sm:inline-block">
        <Space.Compact>
          <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
            后退
          </Button>
          <Button icon={<RightOutlined />} onClick={() => navigate(1)}>
            前进
          </Button>
        </Space.Compact>
      </div>
    </div>
  )
}

export default FileNavigate
