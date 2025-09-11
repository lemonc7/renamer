import React from "react"
import { useLocation } from "react-router"
import CustomTable from "../../components/CustomTable"
import { getFiles } from "../../api/api"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import NotFound from "../NotFound"
import { useSavedSeries } from "../../stores/useSavedSeries"
import ButtonGroups from "../../components/FileHandle/buttonGroups"

const Main: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const location = useLocation()
  const [error, setError] = React.useState<Error | null>(null)
  const setSelectedFiles = useSelectedFilesStore(
    (state) => state.setSelectedFiles
  )
  const setSeries = useSavedSeries((state) => state.setSavedSeries)
  React.useEffect(() => {
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
      {error !== null ? (
        <NotFound />
      ) : (
        <>
          <CustomTable key={location.pathname} isMobile={isMobile} />
        </>
      )}
      <div className="inline-block sm:hidden">
        <ButtonGroups />
      </div>
    </>
  )
}

export default Main
