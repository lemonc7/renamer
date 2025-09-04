import { Layout as AntiLayout } from "antd"
import { Header, Content, Footer } from "antd/es/layout/layout"
import type React from "react"
import Breadcrumb from "../../components/Breadcrumb"
import Main from "../Main"

const Layout: React.FC = () => {
  return (
    <AntiLayout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb />
        <Main />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </AntiLayout>
  )
}

export default Layout
