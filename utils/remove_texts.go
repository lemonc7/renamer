package utils

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/lemonc7/renamer/model"
)

// 返回一个新的文件名，去除原文件名中的指定文本
func removeStrings(fileName string, texts []string) string {
	ext := filepath.Ext(fileName)
	newName := fileName[:len(fileName)-len(ext)]

	for _, text := range texts {
		newName = strings.ReplaceAll(newName, text, "")
	}
	newName += ext

	return newName
}

func RemoveTexts(req model.RemoveTextsRequest) ([]model.NameMap, error) {
	var nameMaps []model.NameMap
	// 获取文件信息
	for _, entry := range req.Targets {
		files, err := GetFiles(filepath.Join(req.Dir, entry))
		if err != nil {
			return nameMaps, fmt.Errorf("获取文件: %w",err)
		}

		var names []model.Name
		var newNames []string
		// 遍历文件信息
		for _, file := range files {
			if !file.IsDir {
				newName := removeStrings(file.Name, req.Texts)
				newNames = append(newNames, newName)

				names = append(names, model.Name{
					OldName: file.Name,
					NewName: newName,
				})
			}
		}

		// 新名称重复就报错
		if err := IsElementRepeat(newNames); err != nil {
			return nameMaps, err
		}

		nameMaps = append(nameMaps, model.NameMap{
			Dir:   entry,
			Files: names,
		})
	}
	return nameMaps, nil
}
