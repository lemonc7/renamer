package utils

import (
	"path/filepath"
	"strings"
	"unicode"

	"github.com/lemonc7/renamer/model"
	"github.com/mozillazg/go-pinyin"
)

var zhPunctMap = map[rune]string{
	'，': ",", '。': ".", '！': "!", '？': "?",
	'；': ";", '：': ":", '（': "(", '）': ")",
	'【': "[", '】': "]", '“': "\"", '”': "\"",
	'‘': "'", '’': "'", '、': ",", '—': "-", '…': "...",
}

func convertToPinyin(s string) string {
	args := pinyin.NewArgs()
	args.Style = pinyin.Normal

	var b strings.Builder
	for _, r := range s {
		switch {
		// 汉字转拼音
		case unicode.Is(unicode.Han, r):
			py := pinyin.SinglePinyin(r, args)
			if len(py) > 0 {
				b.WriteString(py[0])
			} else {
				b.WriteRune(r)
			}
		// 匹配map中的中英标点符号映射
		case zhPunctMap[r] != "":
			b.WriteString(zhPunctMap[r])
		// 不满足的直接返回
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

func ReplaceChinese(req model.PathRequest) ([]model.NameMap, error) {
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
			if !file.IsDir {
				newName := convertToPinyin(file.Name)
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
