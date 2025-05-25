package model

type FileInfo struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Size    string `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

// 获取目录-GetFiles---Path
// 创建文件夹-CreateDir---Path
// 删除文件-DeleteFiles---Path,NameMaps(key)
// 复制文件-CopyFiles---Path,TargetPath,NameMaps(key)
// 移动文件-MoveFiles---Path,TargetPath,NameMaps(key)
// 预览重命名-RenamePreview---Path,AutoRename,NameMaps(key)
// 确认重命名-RenameFiles---Path,NameMaps(key,value)
type PathRequest struct {
	Path       string             `json:"path" form:"path" binding:"required"`
	TargetPath string             `json:"targetPath"`
	AutoRename bool               `json:"autoRename"`
	NameMaps   map[string][]Names `json:"nameMaps"`
}

type Names struct {
	OldName string `json:"oldName"`
	NewName string `json:"newName"`
}
