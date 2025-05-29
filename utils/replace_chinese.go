package utils

import (
	"strings"
	"unicode"

	"github.com/mozillazg/go-pinyin"
)


var zhPunctMap = map[rune]string{
	'，': ",", '。': ".", '！': "!", '？': "?",
	'；': ";", '：': ":", '（': "(", '）': ")",
	'【': "[", '】': "]", '“': "\"", '”': "\"",
	'‘': "'", '’': "'", '、': ",", '—': "-", '…': "...",
}

func ConvertToPinyin(s string) string {
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