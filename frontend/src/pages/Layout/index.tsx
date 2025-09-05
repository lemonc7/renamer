import { Layout } from "antd"
import { Header, Content, Footer } from "antd/es/layout/layout"
import type React from "react"
import CustomBreadcrumb from "../../components/CustomBreadcrumb"
import Main from "../Main"

const CustomLayout: React.FC = () => {
  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <CustomBreadcrumb />
        <Main />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  )
}

export default CustomLayout
