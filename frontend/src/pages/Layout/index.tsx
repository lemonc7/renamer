import { Layout } from "antd"
import { Content, Footer } from "antd/es/layout/layout"
import type React from "react"
import CustomBreadcrumb from "../../components/CustomBreadcrumb"
import Main from "../Main"
import CustomHeader from "../../components/CustomHeader"
import { useRefresh } from "../../stores/useRefresh"

const CustomLayout: React.FC = () => {
  const refreshKey = useRefresh((state) => state.refreshKey)
  return (
    <Layout>
      <CustomHeader />
      <Content style={{ padding: "0 48px" }}>
        <CustomBreadcrumb />
        <Main key={refreshKey} />
      </Content>
      <Footer style={{ textAlign: "center" }}></Footer>
    </Layout>
  )
}

export default CustomLayout
