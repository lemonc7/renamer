import { theme } from "antd"
import type React from "react"
import { useLocation } from "react-router"
import Table from "../../components/Table"
import { useEffect } from "react"
import { getFiles } from "../../api/api"

const Main: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    getFiles(location.pathname)
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
