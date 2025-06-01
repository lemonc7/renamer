package utils

import (
	"os"
	"path/filepath"

	"github.com/lemonc7/renamer/model"
)

func DeleteFiles(req model.PathRequest) error {
	for _, entry := range req.NameMaps {
		path := filepath.Join(req.Path,entry.DirName)
		// 检查文件或文件夹是否存在
		if _, err := os.Stat(path); err != nil {
			return err
		}

		// 删除文件
		if err := os.RemoveAll(path); err != nil {
			return err
		}
	}
	return nil
}
