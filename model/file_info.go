package model

type FileInfo struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Size    string `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

type PathRequest struct {
	Path       string     `json:"path" form:"path" binding:"required"`
	TargetPath string     `json:"targetPath"`
	Season     string     `json:"season"`
	NameMaps   []NameMaps `json:"nameMaps"`
	AutoRename bool       `json:"autoRename"`
}

type NameMaps struct {
	OldName string `json:"oldName"`
	NewName string `json:"newName"`
}
