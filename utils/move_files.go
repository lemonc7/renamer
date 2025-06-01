package utils

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"syscall"

	"github.com/lemonc7/renamer/model"
)

func MoveFiles(req model.PathRequest) error {
	for _, entry := range req.NameMaps {
		path := filepath.Join(req.Path, entry.DirName)
		targetPath := filepath.Join(req.TargetPath, entry.DirName)

		if info, err := os.Stat(targetPath); err == nil && !info.IsDir() {
			return fmt.Errorf("target file exists: %s", info.Name())
		} else if err != nil && !os.IsNotExist(err) {
			return err
		}

		if err := os.Rename(path, targetPath); err != nil {
			if errors.Is(err, syscall.EXDEV) {
				newReq := model.PathRequest{
					Path:       req.Path,
					TargetPath: req.TargetPath,
					NameMaps: []model.NameMap{
						entry,
					},
				}

				// 先复制文件
				if err := CopyFiles(newReq); err != nil {
					return err
				}
				// 删除源文件
				if err := DeleteFiles(newReq); err != nil {
					return err
				}

			} else {
				return err
			}
		}
	}
	return nil
}
