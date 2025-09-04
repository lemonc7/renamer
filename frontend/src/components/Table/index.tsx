import type { TableColumnsType } from "antd"
import React from "react"
import type { FileInfo } from "../../models"
import { Table as AntdTable } from "antd"
import { useFileListStore } from "../../stores/useFileList"
import type { TableRowSelection } from "antd/es/table/interface"
import { useSelectedFilesStore } from "../../stores/useSelectedFiles"
import { FolderOutlined, FileOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router"

const Table: React.FC = () => {
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
            const newPath = `${location.pathname.replace(/\/$/, "")}/${record.name}`
            navigate(newPath)
          }
        }
        return (
          <span
            onClick={handleClick}
            style={{
              cursor: record.isDir ? "pointer" : "default",
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
    onChange: (keys) => {
      setSelectedFiles(
        (keys as string[])
          .map((id) => fileMap.get(id)!)
          .filter((f): f is FileInfo => !!f)
      )
    },
    selections: [
      AntdTable.SELECTION_ALL,
      AntdTable.SELECTION_INVERT,
      AntdTable.SELECTION_NONE
    ]
  }
  return (
    <AntdTable<FileInfo>
      rowKey={(file) => file.id}
      columns={columns}
      dataSource={fileList}
      pagination={false}
      rowSelection={rowSelection}
    />
  )
}

export default Table
