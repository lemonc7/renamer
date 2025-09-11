import type { TableColumnsType } from "antd"
import React from "react"
import type { FileInfo } from "../../models"
import { Table, Tooltip } from "antd"
import { useFileListStore } from "../../stores/useFileList"
import type { TableRowSelection } from "antd/es/table/interface"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { FolderOutlined, FileOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router"

const CustomTable: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const fileList = useFileListStore((state) => state.fileList)
  const fileMap = useFileListStore((state) => state.fileMap)
  const { selectedFiles, setSelectedFiles } = useSelectedFilesStore()

  const columns: TableColumnsType<FileInfo> = []
  columns.push({
    title: "名称",
    dataIndex: "name",
    width: isMobile ? "70%" : "60%",
    render: (text: string, record: FileInfo) => (
      <RenderFileName name={text} record={record} />
    )
  })
  columns.push({
    title: "大小",
    dataIndex: "size",
    width: isMobile ? "30%" : "10%"
  })
  if (!isMobile) {
    columns.push({
      title: "类型",
      dataIndex: "type",
      width: isMobile ? undefined : "10%"
    })
    columns.push({
      title: "修改时间",
      dataIndex: "modTime",
      width: isMobile ? undefined : "20%"
    })
  }

  const rowSelection: TableRowSelection<FileInfo> = {
    selectedRowKeys: selectedFiles.map((file) => file.id),
    onChange: (keys: React.Key[]) => {
      setSelectedFiles(
        keys
          .map((id) => fileMap.get(String(id)))
          .filter((f): f is FileInfo => !!f)
      )
    },
    selections: [
      {
        key: "all",
        text: "全选",
        onSelect: (changeableRowKeys: React.Key[]) => {
          setSelectedFiles(
            changeableRowKeys
              .map((id) => fileMap.get(String(id)))
              .filter((f): f is FileInfo => !!f)
          )
        }
      },
      {
        key: "invert",
        text: "反选",
        onSelect: (changeableRowKeys: React.Key[]) => {
          const selectedSet = new Set(selectedFiles.map((f) => f.id))
          const inverted = changeableRowKeys.filter(
            (id) => !selectedSet.has(String(id))
          )
          setSelectedFiles(
            inverted
              .map((id) => fileMap.get(String(id)))
              .filter((f): f is FileInfo => !!f)
          )
        }
      },
      {
        key: "none",
        text: "取消全选",
        onSelect: () => {
          setSelectedFiles([])
        }
      },
      {
        key: "allDirs",
        text: "全选文件夹",
        onSelect: (changeableRowKeys: React.Key[]) => {
          setSelectedFiles(
            changeableRowKeys
              .map((id) => fileMap.get(String(id)))
              .filter((f): f is FileInfo => !!f && f.isDir)
          )
        }
      },
      {
        key: "allFiles",
        text: "全选文件",
        onSelect: (changeableRowKeys: React.Key[]) => {
          setSelectedFiles(
            changeableRowKeys
              .map((id) => fileMap.get(String(id)))
              .filter((f): f is FileInfo => !!f && !f.isDir)
          )
        }
      }
    ]
  }
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <Table<FileInfo>
        rowKey={(file) => file.id as string}
        columns={columns}
        dataSource={fileList}
        pagination={false}
        rowSelection={rowSelection}
        sticky
      />
    </div>
  )
}

const RenderFileName: React.FC<{
  name: string
  record: FileInfo
}> = ({ name, record }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (record.isDir) {
      const newPath = `${location.pathname.replace(/\/$/, "")}/${record.name}`
      navigate(newPath)
    }
  }

  const content = (
    <div
      onClick={handleClick}
      className={`flex items-center ${
        record.isDir ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {record.isDir ? (
        <FolderOutlined className="mx-2" />
      ) : (
        <FileOutlined className="mx-2" />
      )}
      <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
        {name}
      </span>
    </div>
  )

  return (
    <Tooltip title={name} placement="topLeft" mouseEnterDelay={0.5}>
      {content}
    </Tooltip>
  )
}

export default CustomTable
