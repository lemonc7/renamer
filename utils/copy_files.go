package utils

import (
	"io"
	"os"
	"path/filepath"

	"github.com/lemonc7/renamer/model"
)

func CopyFiles(req model.PathRequest) error {
	for _, entry := range req.NameMaps {
		path := filepath.Join(req.Path, entry.DirName)
		targetPath := filepath.Join(req.TargetPath, entry.DirName)

		info, err := os.Stat(path)
		if err != nil {
			return err
		}
		// 复制文件夹
		if info.IsDir() {
			sourcePath := os.DirFS(path)
			if err := os.CopyFS(targetPath, sourcePath); err != nil {
				return err
			}
		} else { //复制文件
			// 打开源文件
			sourceFile, err := os.Open(path)
			if err != nil {
				return err
			}
			defer sourceFile.Close()

			// 创建新文件(只有当文件不存在时才创建,不然报错---原子性)
			targetFile, err := os.OpenFile(targetPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0666)
			if err != nil {
				return err
			}
			defer targetFile.Close()

			// 复制文件内容
			if _, err := io.Copy(targetFile, sourceFile); err != nil {
				return err
			}
		}
	}
	return nil
}
