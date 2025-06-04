package utils

import (
	"os"
	"path/filepath"
	"regexp"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, nameMaps []model.Name) error {

	for _, entry := range nameMaps {
		oldPath := filepath.Join(path, entry.OldName)
		newPath := filepath.Join(path, entry.NewName)
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
		var newNames []string

		files, err := GetFiles(filepath.Join(req.Path, entry.DirName))
		if err != nil {
			return nameMaps, err
		}

		// 遍历文件信息
		for _, file := range files {
			// 获取待处理的文件
			ignore, oldName := GetPendingFile(file)
			if ignore {
				// 需要重命名的文件
				newName, err := extractEpisode(oldName)
				if err != nil {
					return nameMaps, err
				}
				// 输出SxxExx标准命名格式
				renameFormat(entry.DirName, &newName)
				newNames = append(newNames, newName)
				names = append(names, model.Name{
					OldName: oldName,
					NewName: newName,
				})
			} else {
				// 不需要重命名的文件
				if oldName != "error" {
					newNames = append(newNames, oldName)
					names = append(names, model.Name{
						OldName: oldName,
						NewName: oldName,
					})
				}
			}
		}

		// 判断是否有重名
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
