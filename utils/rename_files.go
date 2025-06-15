package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, episodeOffset int, names []model.Name) error {
	for _, entry := range names {
		oldPath := filepath.Join(path, entry.OldName)
		// 根据offset获取新名称
		newName, err := updateEpisode(entry.NewName, episodeOffset)
		if err != nil {
			return err
		}
		newPath := filepath.Join(path, newName)
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
		var newNames []string

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
				// 
				if newName == "" {
					continue
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

func updateEpisode(name string, offset int) (string, error) {
	// 没有集数偏移, 直接返回
	if offset == 0 {
		return name, nil
	}

	ext := filepath.Ext(name)
	nameWithoutExt := name[:len(name)-len(ext)]
	// string格式应该是SxxExx(x...),直接提取第5位到最后1位字符---需要保证字符不小于5
	if len(nameWithoutExt) < 5 {
		return "", fmt.Errorf("invalid episode type: %s", name)
	}

	episodeStr := nameWithoutExt[4:]
	episode, err := strconv.Atoi(episodeStr)
	if err != nil {
		return "", err
	}

	// 集数偏移
	newEpisode := episode + offset
	if newEpisode < 1 {
		return "", fmt.Errorf("episode %s will be <1 after offset", name)
	}

	return fmt.Sprintf("%s%02d%s", nameWithoutExt[:4], newEpisode, ext), nil
}
