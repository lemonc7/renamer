package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/lemonc7/renamer/model"
)

func DeleteFiles(req model.DeleteRequest) error {
	for _, entry := range req.Targets {
		path := filepath.Join(req.Dir, entry)
		// 检查文件或文件夹是否存在
		if _, err := os.Stat(path); err != nil {
			return fmt.Errorf("check path: %w", err)
		}

		// 删除文件
		if err := os.RemoveAll(path); err != nil {
			return err
		}
	}
	return nil
}
