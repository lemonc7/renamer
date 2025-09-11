import type { TableColumnsType } from "antd"
import React from "react"
import type { FileInfo } from "../../models"
import { Table } from "antd"
import { useFileListStore } from "../../stores/useFileList"
import type { TableRowSelection } from "antd/es/table/interface"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { FolderOutlined, FileOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router"

const CustomTable: React.FC = () => {
  const fileList = useFileListStore((state) => state.fileList)
  const fileMap = useFileListStore((state) => state.fileMap)
  const { selectedFiles, setSelectedFiles } = useSelectedFilesStore()
  const location = useLocation()
  const navigate = useNavigate()

  const columns: TableColumnsType<FileInfo> = [
    {
      title: "名称",
      dataIndex: "name",
      render: (text: string, record: FileInfo) => {
        const handleClick = () => {
          if (record.isDir) {
            const newPath = `${location.pathname.replace(/\/$/, "")}/${
              record.name
            }`
            navigate(newPath)
          }
        }
        return (
          <span
            onClick={handleClick}
            style={{
              cursor: record.isDir ? "pointer" : "default"
            }}
          >
            {record.isDir ? (
              <FolderOutlined style={{ marginRight: 4 }} />
            ) : (
              <FileOutlined style={{ marginRight: 4 }} />
            )}
            {text}
          </span>
        )
      }
    },
    {
      title: "类型",
      dataIndex: "type"
    },
    {
      title: "大小",
      dataIndex: "size"
    },
    {
      title: "修改时间",
      dataIndex: "modTime"
    }
  ]

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
    <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
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

export default CustomTable
