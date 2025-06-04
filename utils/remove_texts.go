package utils

import (
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

func RemoveTexts(req model.PathRequest) ([]model.NameMap, error) {
	var nameMaps []model.NameMap
	// 获取文件信息
	for _, entry := range req.NameMaps {
		files, err := GetFiles(filepath.Join(req.Path, entry.DirName))
		if err != nil {
			return nameMaps, err
		}

		var names []model.Name
		var newNames []string
		// 遍历文件信息
		for _, file := range files {
			if !file.IsDir {
				newName := removeStrings(file.Name, req.RemovedTexts)
				newNames = append(newNames, newName)

				names = append(names, model.Name{
					OldName: file.Name,
					NewName: newName,
				})
			}
		}

		// 新名称重复就报错
		if err := elementRepeat(newNames); err != nil {
			return nameMaps, err
		}

		nameMaps = append(nameMaps, model.NameMap{
			DirName:   entry.DirName,
			FilesName: names,
		})
	}
	return nameMaps, nil
}
