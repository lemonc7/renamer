import { Layout, theme } from "antd"
import { Content } from "antd/es/layout/layout"
import type React from "react"
import CustomBreadcrumb from "../../components/CustomBreadcrumb"
import Main from "../Main"
import CustomHeader from "../../components/CustomHeader"
import { useRefresh } from "../../stores/useRefresh"
import CustomFooter from "../../components/CustomFooter"

const CustomLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()
  const refreshKey = useRefresh((state) => state.refreshKey)
  return (
    <Layout>
      <CustomHeader />
      <Content style={{ padding: "0 48px" }}>
        <div style={{ padding: "16px 0" }}>
          <CustomBreadcrumb />
        </div>
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 64px - 48px - 64px - 32px)"
          }}
        >
          <Main key={refreshKey} />
        </div>
      </Content>
      <CustomFooter />
    </Layout>
  )
}

export default CustomLayout
