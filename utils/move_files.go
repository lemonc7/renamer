package utils

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"syscall"

	"github.com/lemonc7/renamer/model"
)

func MoveFiles(req model.CopyRequest) error {
	for _, entry := range req.Originals {
		src := filepath.Join(req.Dir, entry)
		target := filepath.Join(req.TargetDir, entry)

		info, err := os.Stat(target)
		// 检查目标路径
		if err == nil {
			if !info.IsDir() {
				return fmt.Errorf("目标文件已存在且不是目录: %s", target)
			}
		} else {
			// 排除文件不存在的错误
			if !os.IsNotExist(err) {
				return fmt.Errorf("获取目前路径: %w", err)
			}
		}

		if err := os.Rename(src, target); err != nil {
			if errors.Is(err, syscall.EXDEV) {
				// 跨文件系统
				// 先复制文件
				if err := CopyFiles(model.CopyRequest{
					Dir:       req.Dir,
					TargetDir: req.TargetDir,
					Originals: []string{entry},
				}); err != nil {
					return fmt.Errorf("复制文件/目录: %w", err)
				}
				// 删除源文件
				if err := DeleteFiles(model.DeleteRequest{
					Dir:     req.Dir,
					Targets: []string{entry},
				}); err != nil {
					return fmt.Errorf("删除源文件/目录: %w", err)
				}
				continue //成功，继续处理下一个
			}
			return err
		}
	}
	return nil
}
