package model

// 获取的文件信息
type FileInfo struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Size    string `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

// 前端的请求参数
// 获取目录-GetFiles---Path
// 创建文件夹-CreateDir---Path
// 删除文件-DeleteFiles---Path,NameMaps(dirName)
// 复制文件-CopyFiles---Path,TargetPath,NameMaps(dirName)
// 移动文件-MoveFiles---Path,TargetPath,NameMaps(dirName)
// 预览重命名-RenamePreview---Path,NameMaps(dirName)
// 移除中文预览-RemoveChinesePreview---Path,NameMaps(dirName)
// 移除指定文本并预览-RemoveTextsPreview---Path,NameMaps(dirmName)
// 确认重命名-RenameFiles---Path,NameMaps(dirName,filesName)
type PathRequest struct {
	Path         string    `json:"path" form:"path" binding:"required"`
	TargetPath   string    `json:"targetPath"`
	NameMaps     []NameMap `json:"nameMaps"`
	RemovedTexts []string  `json:"removedTexts"`
}

// 重命名前后的文件名
type Name struct {
	OldName string `json:"oldName"`
	NewName string `json:"newName"`
}

type NameMap struct {
	DirName   string `json:"dirName"`
	FilesName []Name `json:"filesName"`
}
