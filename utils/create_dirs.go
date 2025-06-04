package utils

import (
	"errors"
	"os"
)

func CreateDirs(path string) error {
	// 检查目录是否存在
	_, err := os.Stat(path)
	if err == nil {
		return errors.New("目录已存在: " + path)
	}
	// 创建目录
	if err := os.Mkdir(path, 0755); err != nil {
		return err
	}

	return nil

}
