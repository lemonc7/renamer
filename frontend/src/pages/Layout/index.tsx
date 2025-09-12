import { Layout, message } from "antd"
import React from "react"
import CustomBreadcrumb from "../../components/CustomBreadcrumb"
import Main from "../Main"
import CustomHeader from "../../components/CustomHeader"
import { useRefresh } from "../../stores/useRefresh"
import CustomFooter from "../../components/CustomFooter"
import { MessageContext } from "../../utils/useMessageApi"
import ButtonGroups from "../../components/FileHandle/buttonGroups"

const CustomLayout: React.FC = () => {
  const refreshKey = useRefresh((state) => state.refreshKey)
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640)
  const [messageApi, contextHolder] = message.useMessage({
    duration: 2,
    maxCount: 2,
    top: 50
  })
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      <Layout className="h-screen flex flex-col">
        <CustomHeader />
        <div className="px-4 sm:px-12">
          <div className="py-4">
            <CustomBreadcrumb isMobile={isMobile} />
          </div>
          <div
            className="flex flex-col"
            style={{
              height: "calc(100vh - 64px - 32px - 64px)"
            }}
          >
            <Main key={refreshKey} isMobile={isMobile} />
          </div>
        </div>
        <CustomFooter />
        <div className="inline-block sm:hidden">
          <ButtonGroups />
        </div>
      </Layout>
    </MessageContext.Provider>
  )
}

export default CustomLayout
