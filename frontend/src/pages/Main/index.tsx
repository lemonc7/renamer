import type React from "react"
import { useLocation } from "react-router"
import CustomTable from "../../components/CustomTable"
import { useEffect, useState } from "react"
import { getFiles } from "../../api/api"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import NotFound from "../NotFound"
import { useSavedSeries } from "../../stores/useSavedSeries"

const Main: React.FC = () => {
  const location = useLocation()
  const [error, setError] = useState<Error | null>(null)
  const setSelectedFiles = useSelectedFilesStore(
    (state) => state.setSelectedFiles
  )
  const setSeries = useSavedSeries((state) => state.setSavedSeries)
  useEffect(() => {
    setSelectedFiles([])
    setSeries("")
    setError(null)
    const fetchFiles = async () => {
      try {
        await getFiles(location.pathname)
      } catch (error) {
        console.error("获取文件失败", error)
        setError(error as Error)
      }
    }
    fetchFiles()
  }, [location.pathname, setSelectedFiles, setSeries])

  return (
    <>
      {error !== null ? <NotFound /> : <CustomTable key={location.pathname} />}
    </>
  )
}

export default Main
