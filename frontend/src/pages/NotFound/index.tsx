import React from "react"
import { useNavigate } from "react-router"
import { Button } from "antd"

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">抱歉，你访问的页面不存在。</p>
      <Button type="primary" onClick={() => navigate("/home")}>
        返回首页
      </Button>
    </div>
  )
}

export default NotFound
