package utils

import (
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/lemonc7/renamer/model"
)

// 获取给定目录下的文件信息，返回文件信息切片
func GetFiles(dir string) ([]model.FileInfo, error) {
	// 读取目录
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	// 遍历文件和目录，存储相关信息
	var files []model.FileInfo
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}

		var size, fileType string
		if entry.IsDir() {
			size = "-"
			fileType = "-"
		} else {
			size = humanize.Bytes(uint64(info.Size()))
			ext := filepath.Ext(entry.Name())
			if len(ext) == len(entry.Name()) {
				fileType = ""
			} else {
				fileType = strings.Replace(ext, ".", "", 1)
			}
		}

		files = append(files, model.FileInfo{
			Name:    entry.Name(),
			Size:    size,
			Type:    fileType,
			IsDir:   entry.IsDir(),
			ModTime: info.ModTime().Format("2006-01-02 15:04:05"),
		})
	}
	return files, nil
}

// 只保留指定后缀名的文件,并排除已经按规则命名的文件,通过bool值来控制string后续是否要处理
func GetPendingFile(file model.FileInfo) (bool, string) {
	// 过滤文件夹
	if !file.IsDir {
		fileNameWithoutExt := file.Name[:len(file.Name)-len(file.Type)-1]
		// 只保留指定后缀名的文件
		if slices.Contains(matchExts, file.Type) {
			// 排除已经按规则命名的文件
			if ignoreRules(fileNameWithoutExt) {
				return false, file.Name
			} else {
				return true, file.Name
			}
		}
	}
	return false, "error"
}
