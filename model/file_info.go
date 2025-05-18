package model

type FileInfo struct {
	Name    string `json:"name"`
	Size    string  `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

type PathRequest struct {
	Path       string `json:"path" form:"path" binding:"required"`
	TargetPath string `json:"targetPath"`
}
