package utils

import (
	"path/filepath"
	"strings"
)




// 返回一个新的文件名，去除原文件名中的指定文本
func RemoveTexts(fileName string, texts []string) string {
	ext := filepath.Ext(fileName)
	newName := fileName[:len(fileName)-len(ext)]

	for _, text := range texts {
		newName = strings.ReplaceAll(newName, text, "")
	}
	newName += ext

	return newName
}
