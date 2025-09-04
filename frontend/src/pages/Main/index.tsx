import { theme } from "antd"
import type React from "react"
import { useLocation } from "react-router"
import Table from "../../components/Table"
import { useEffect } from "react"
import { getFiles } from "../../api/api"

const Main: React.FC = () => {
  const location = useLocation()
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        await getFiles(location.pathname)
      } catch (error) {
        console.error("获取文件失败", error)
      }
    }
    fetchFiles()
  }, [location.pathname])

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  return (
    <div
      style={{
        background: colorBgContainer,
        minHeight: 500,
        padding: 24,
        borderRadius: borderRadiusLG
      }}
    >
      <Table />
    </div>
  )
}

export default Main
