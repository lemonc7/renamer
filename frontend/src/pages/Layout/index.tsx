import { Layout } from "antd"
import type React from "react"
import CustomBreadcrumb from "../../components/CustomBreadcrumb"
import Main from "../Main"
import CustomHeader from "../../components/CustomHeader"
import { useRefresh } from "../../stores/useRefresh"
import CustomFooter from "../../components/CustomFooter"

const CustomLayout: React.FC = () => {
  const refreshKey = useRefresh((state) => state.refreshKey)
  return (
    <Layout className="h-screen flex flex-col">
      <CustomHeader />
      <div className="px-4 sm:px-12">
        <div className="py-4">
          <CustomBreadcrumb />
        </div>
        <div
          className="flex flex-col"
          style={{
            height: "calc(100vh - 64px - 32px - 64px)"
          }}
        >
          <Main key={refreshKey} />
        </div>
      </div>
      <CustomFooter />
    </Layout>
  )
}

export default CustomLayout
