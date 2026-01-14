package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/google/uuid"
	"github.com/lemonc7/renamer/config"
	"github.com/lemonc7/renamer/model"
	"github.com/mozillazg/go-pinyin"
)

// 获取给定目录下的文件信息，返回文件信息切片
func GetFiles(dir string) ([]model.File, error) {
	// 读取目录
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("读取目录: %w", err)
	}

	// 遍历文件和目录，存储相关信息
	var files []model.File
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return nil, fmt.Errorf("获取文件信息: %w", err)
		}

		var size, fileType string
		if entry.IsDir() {
			size = "-"
			fileType = "-"
		} else {
			size = humanize.Bytes(uint64(info.Size()))
			ext := filepath.Ext(entry.Name())
			if len(ext) == len(entry.Name()) {
				fileType = ""
			} else {
				fileType = strings.Replace(ext, ".", "", 1)
			}
		}

		files = append(files, model.File{
			ID:      uuid.NewString(),
			Name:    entry.Name(),
			Size:    size,
			Type:    fileType,
			IsDir:   entry.IsDir(),
			ModTime: info.ModTime().Format("2006-01-02 15:04:05"),
		})
	}

	args := pinyin.NewArgs()
	// 整理文件排序,文件夹优先,名称a-z
	slices.SortFunc(files, func(a, b model.File) int {
		// 文件夹优先
		if a.IsDir != b.IsDir {
			if a.IsDir {
				return -1 // a 排在前
			}
			return 1 // b 排在前
		}

		keyA := getSortKey(a.Name, args)
		keyB := getSortKey(b.Name, args)

		// 名称 a~z
		switch {
		case keyA < keyB:
			return -1
		case keyA > keyB:
			return 1
		default:
			return 0
		}
	})

	return files, nil
}

func getSortKey(name string, args pinyin.Args) string {
	if name == "" {
		return ""
	}
	// 汉字取第一个拼音
	first := []rune(name)[0]
	if first >= '\u4e00' && first <= '\u9fff' {
		py := pinyin.Pinyin(string(first), args)
		if len(py) > 0 && len(py[0]) > 0 {
			return py[0][0]
		}

	}
	// 英文变小写返回
	return strings.ToLower(string(name))
}

// 只保留指定后缀名的文件,并排除已经按规则命名的文件,通过bool值来控制string后续是否要处理
func GetPendingFile(file model.File) (bool, string) {
	// 过滤文件夹
	if !file.IsDir {
		fileNameWithoutExt := file.Name[:len(file.Name)-len(file.Type)-1]
		// 只保留指定后缀名的文件
		if slices.Contains(config.Cfg.MatchExts, file.Type) {
			// 排除已经按规则命名的文件
			return !ignoreRules(fileNameWithoutExt), file.Name
		}
	}
	return false, "error"
}
