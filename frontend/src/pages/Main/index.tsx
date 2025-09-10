import { message, theme } from "antd"
import type React from "react"
import { useLocation } from "react-router"
import CustomTable from "../../components/CustomTable"
import { useEffect, useState } from "react"
import { getFiles } from "../../api/api"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import NotFound from "../NotFound"

const Main: React.FC = () => {
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const [error, setError] = useState<Error | null>(null)
  const setSelectedFiles = useSelectedFilesStore(
    (state) => state.setSelectedFiles
  )
  useEffect(() => {
    setSelectedFiles([])
    setError(null)
    const fetchFiles = async () => {
      try {
        await getFiles(location.pathname)
      } catch (error) {
        messageApi.error("获取文件失败")
        console.error("获取文件失败", error)
        setError(error as Error)
      }
    }
    fetchFiles()
  }, [location.pathname, setSelectedFiles, messageApi])

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  return (
    <>
      {contextHolder}
      <div
        style={{
          background: colorBgContainer,
          padding: 24,
          borderRadius: borderRadiusLG
        }}
      >
        {error !== null ? (
          <NotFound />
        ) : (
          <CustomTable key={location.pathname} />
        )}
      </div>
    </>
  )
}

export default Main
