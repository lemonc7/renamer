package utils

var matchExts = []string {
	"flv","mkv","mp4","avi","rmvb","m2ts","wmv","nfo",
	"srt","ass","ssa","sub","smi",
}

var ignorePattens = []string{
	`^S\d{2}E\d{2,}$`,
}

var bracketPairs = [][]string{
	{`\[`,`\]`},
	{`\(`,`\)`},
	{`【`,`】`},
	{`「`,`」`},
}

// 搭配括号
var pattens = [][]string {
	// 只匹配1~3位数字,避免匹配到年份,兼容xxx.5v2 end
	{"1",`(\d{1,3}(\.5)?)([Vv]\d{1})?\s?(?:_)?(?i:END)?`},
	{"1",`第(\d{1,4}(\.5)?)[集话話]`},
	{"2",`([Ee][Pp]|[Ss][Pp]|[Ee])(\d{1,4}(\.5)?)([Vv]\d{1})?\s?(?:_)?(?i:END)?`},
}

var cleanPattens = [][]string {
	{"1",`第(\d{1,4}(\.5)?)[集话話]`},
	{"2",`([Ee][Pp]|[Ss][Pp]|[Ee])(\d{1,4}(\.5)?)`},
}