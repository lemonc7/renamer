package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"

	"github.com/lemonc7/renamer/model"
)

func RenameFiles(path string, names []model.Name) error {
	// 新名称重复就报错
	newNames := make([]string, len(names))
	for i, name := range names {
		newNames[i] = name.NewName
	}
	if err := elementRepeat(newNames); err != nil {
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
				// 更新剧集偏移
				newNameWithOffset, err := updateEpisode(newName, entry.EpisodeOffset)
				if err != nil {
					return nameMaps, err
				}
				names = append(names, model.Name{
					OldName: oldName,
					NewName: newNameWithOffset,
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

func updateEpisode(name string, offset int) (string, error) {
	// 没有集数偏移, 直接返回
	if offset == 0 {
		return name, nil
	}

	ext := filepath.Ext(name)
	nameWithoutExt := name[:len(name)-len(ext)]
	// string格式应该是SxxExx(x...),直接提取第5位到最后1位字符---需要保证字符不小于5
	if len(nameWithoutExt) < 5 {
		return "", fmt.Errorf("无效格式: %s", name)
	}

	episodeStr := nameWithoutExt[4:]
	episode, err := strconv.Atoi(episodeStr)
	if err != nil {
		return "", err
	}

	// 集数偏移
	newEpisode := episode + offset
	if newEpisode < 1 {
		return "", fmt.Errorf("偏移后的剧集[%s]会小于1", name)
	}

	return fmt.Sprintf("%s%02d%s", nameWithoutExt[:4], newEpisode, ext), nil
}
