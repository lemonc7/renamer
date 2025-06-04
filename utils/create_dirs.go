package utils

import "os"

func CreateDirs(path string) error {
	// 检查目录是否存在
	_, err := os.Stat(path)
	if err != nil {
		return err
	}
	// 创建目录
	if err := os.Mkdir(path, 0755); err != nil {
		return err
	}

	return nil

}
