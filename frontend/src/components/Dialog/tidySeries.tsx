import { Input, message, Modal, Select, Tooltip } from "antd"
import React, { useMemo } from "react"
import { tidySeries } from "../../api/api"
import { useLocation } from "react-router"
import { joinPath } from "../../utils/path"
import { useRefresh } from "../../stores/useRefresh"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { useSavedSeries } from "../../stores/useSavedSeries"

const TidySeries: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const location = useLocation()
  const [messageApi, contextHolder] = message.useMessage()
  const refresh = useRefresh((state) => state.setRefreshKey)
  const { selectedFiles, setSelectedFiles } = useSelectedFilesStore()
  const selectedDirs = selectedFiles.filter((file) => file.isDir)
  const { savedSeries, setSavedSeries } = useSavedSeries()

  const seasonOptions = Array.from({ length: 100 }, (_, i) => {
    const val = `S${String(i).padStart(2, "0")}`
    return { label: val, value: val }
  })

  const updateSeasons = (id: string, season: string) => {
    const updated = selectedDirs.map((file) =>
      file.id === id ? { ...file, season } : file
    )
    setSelectedFiles(updated)
  }

  const duplicateSeasons = useMemo(() => {
    const seasons = selectedDirs.map((file) => file.season).filter(Boolean)
    return new Set(
      seasons.filter((season, index) => seasons.indexOf(season) !== index)
    )
  }, [selectedDirs])

  const handleOK = async () => {
    if (duplicateSeasons.size > 0) {
      messageApi.error({
        content: `${Array.from(duplicateSeasons).join(",")} 季数重复`
      })
      return
    }

    try {
      await tidySeries(joinPath(location.pathname, []))
      messageApi.success({
        content: "整理完成"
      })
      refresh()
      setSelectedFiles([])
      onClose()
      setSavedSeries("")
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      messageApi.error({
        content: msg
      })
      console.error(error)
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="整理剧集"
        centered
        open={open}
        onCancel={onClose}
        onOk={handleOK}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          disabled: !(
            savedSeries.trim() &&
            selectedDirs.length > 0 &&
            selectedDirs.every((file) => file.season)
          )
        }}
      >
        <Input
          value={savedSeries}
          onChange={(e) => setSavedSeries(e.target.value)}
          placeholder="请输入剧集名称"
          allowClear
        />
        <div style={{ marginTop: 16 }}>
          {selectedDirs.map((file) => (
            <div
              key={file.id}
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              <Select
                style={{ width: 100, marginRight: 8 }}
                options={seasonOptions}
                value={file.season}
                placeholder="选择季"
                onChange={(season) => updateSeasons(file.id, season)}
                status={duplicateSeasons.has(file.season) ? "error" : undefined}
              />
              <Tooltip title={file.name} placement="right">
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis"
                  }}
                >
                  {file.name}
                </span>
              </Tooltip>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export default TidySeries
