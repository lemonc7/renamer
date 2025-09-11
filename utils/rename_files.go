package utils

import (
	"os"
	"path/filepath"
	"regexp"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, names []model.Name) error {
	// 新名称重复就报错
	newNames := make([]string, 0, len(names))
	for _, name := range names {
		newNames = append(newNames, name.NewName)
	}
	if err := IsElementRepeat(newNames); err != nil {
		return err
	}

	for _, entry := range names {
		oldPath := filepath.Join(path, entry.OldName)
		newPath := filepath.Join(path, entry.NewName)
		// 新旧名称不一致时才重命名
		if newPath != oldPath {
			if err := os.Rename(oldPath, newPath); err != nil {
				return err
			}
		}
	}
	return nil
}

func RenamePreview(req model.PathRequest) ([]model.NameMap, error) {
	var nameMaps []model.NameMap

	// 获取文件信息
	for _, entry := range req.NameMaps {
		var names []model.Name

		files, err := GetFiles(filepath.Join(req.Path, entry.DirName))
		if err != nil {
			return nameMaps, err
		}

		// 遍历文件信息
		for _, file := range files {
			// 获取待处理的文件
			needRename, oldName := GetPendingFile(file)
			if needRename {
				// 需要重命名的文件
				newName, err := extractEpisode(oldName)
				if err != nil {
					return nameMaps, err
				}
				if newName == "" {
					continue
				}
				// 输出SxxExx标准命名格式
				renameFormat(entry.DirName, &newName)

				names = append(names, model.Name{
					OldName: oldName,
					NewName: newName,
				})
			} else {
				// 不需要重命名的文件
				if oldName != "error" {
					names = append(names, model.Name{
						OldName: oldName,
						NewName: oldName,
					})
				}
			}
		}

		nameMaps = append(nameMaps, model.NameMap{
			DirName:   entry.DirName,
			FilesName: names,
		})
	}
	return nameMaps, nil
}

// 重命名标准格式输出
func renameFormat(dir string, episode *string) {
	ep := *episode
	ext := filepath.Ext(ep)

	if len(ep[:len(ep)-len(ext)]) < 2 {
		*episode = "0" + *episode
	}

	if regexp.MustCompile(`^[Ss]\d{1,3}$`).MatchString(dir) {
		*episode = dir + "E" + *episode
	} else {
		*episode = "S01E" + *episode
	}

}
