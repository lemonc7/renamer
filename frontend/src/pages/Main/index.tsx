import { theme } from "antd"
import type React from "react"
import { useLocation } from "react-router"
import Table from "../../components/Table"
import { useEffect } from "react"
import { getFiles } from "../../api/api"
import { useFileListStore } from "../../stores/useFileList"

const Main: React.FC = () => {
  const location = useLocation()
  const fileList = useFileListStore((state) => state.fileList)
  useEffect(() => {
    getFiles(location.pathname)
  }, [location.pathname])
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()
  console.log(fileList)
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
