package utils

import (
	"errors"
	"fmt"
	"path/filepath"
	"regexp"
	"strconv"
)

// 忽略已经按规则命名的文件
func ignoreRules(filenameWithoutExt string) bool {
	for _, pattern := range ignorePattens {
		re := regexp.MustCompile(pattern)
		return re.MatchString(filenameWithoutExt)
	}
	return false
}

// 按规则提取集数
func ExtractEpisode(filename string) (string, error) {
	// 获取文件名，无后缀
	ext := filepath.Ext(filename)
	filenameWithoutExt := filename[:len(filename)-len(ext)]

	// 组合括号和规则,按规则匹配集数
	for _, pattern := range pattens {
		for _, pair := range bracketPairs {
			left, right := pair[0], pair[1]
			re := regexp.MustCompile(left + pattern[1] + right)
			if matches := re.FindStringSubmatch(filenameWithoutExt); len(matches) >= 2 {
				i, err := strconv.Atoi(pattern[0])
				if err != nil {
					return "", err
				}
				return matches[i] + ext, nil
			}
		}
	}

	// 括号内未匹配,删除括号内容,方便后续匹配括号外的内容
	var cleanBrackets []string
	for _, pair := range bracketPairs {
		left, right := pair[0], pair[1]
		cleanBrackets = append(cleanBrackets, fmt.Sprintf(`%s[^%s]*%s`, left, right, right))
	}
	cleanFilename := filenameWithoutExt
	for _, pat := range cleanBrackets {
		re := regexp.MustCompile(pat)
		cleanFilename = re.ReplaceAllString(cleanFilename, "")
	}

	// 匹配括号外的内容
	for _, patten := range cleanPattens {
		re := regexp.MustCompile(patten[1])
		if matches := re.FindStringSubmatch(cleanFilename); len(matches) >= 2 {
			i, err := strconv.Atoi(patten[0])
			if err != nil {
				return "", err
			}
			return matches[i] + ext, nil
		}
	}

	// 开始匹配纯数字
	// 匹配10v1,10.5v1...
	re := regexp.MustCompile(`(\d+\.?5?)[Vv]\d+`)
	if matches := re.FindStringSubmatch(cleanFilename); len(matches) >= 2 {
		return matches[1] + ext, nil
	}
	// 匹配纯xx.5这种格式(前后不能有英文,最多只匹配到xxx.5)
	re = regexp.MustCompile(`\b\d{1,3}\.5\b`)
	if matches := re.FindStringSubmatch(cleanFilename); len(matches) >= 1 {
		return matches[0] + ext, nil
	}
	// 匹配文件名最后的数字
	re = regexp.MustCompile(`\d+`)
	matches := re.FindAllString(cleanFilename, -1)
	if len(matches) >= 1 {
		return matches[len(matches)-1] + ext, nil
	}

	return "", errors.New("未匹配到集数")

}
