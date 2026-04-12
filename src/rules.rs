use std::{path::Path, sync::LazyLock};

use regex::Regex;

pub const MATCH_EXTS: &[&str] = &[
    "flv", "mkv", "mp4", "avi", "m2ts", "wmv", "rmvb", "srt", "ass", "ssa", "sub", "smi", "jpg",
    "nfo",
];

// 静态规则定义
static IGNORE_RE: LazyLock<Vec<Regex>> =
    LazyLock::new(|| vec![Regex::new(r"^S\d{2}E\d{2,}$").unwrap()]);

const BRACKET_PAIRS: &[(&str, &str)] = &[
    (r"\[", r"\]"),
    (r"\(", r"\)"),
    (r"【", r"】"),
    (r"「", r"」"),
];

const PATTENS: &[(&str, &str)] = &[
    ("1", r"(\d{1,3}(\.5)?)([Vv]\d{1})?\s?(?:_)?(?i:END)?"),
    ("1", r"第(\d{1,4}(\.5)?)[集话話]"),
    (
        "2",
        r"([Ee][Pp]|[Ss][Pp]|[Ee])(\d{1,4}(\.5)?)([Vv]\d{1})?\s?(?:_)?(?i:END)?",
    ),
];

// 预编译：括号 + 模式 的所有组合 (共 12 种)
static COMBINED_EPISODE_RE: LazyLock<Vec<(usize, Regex)>> = LazyLock::new(|| {
    let mut res = Vec::new();
    for (idx_str, pattern) in PATTENS {
        let i = idx_str.parse::<usize>().unwrap_or(1);
        for (left, right) in BRACKET_PAIRS {
            let re_str = format!("{}{}{}", left, pattern, right);
            res.push((i, Regex::new(&re_str).unwrap()));
        }
    }
    res
});

// 预编译：括号内容清洗正则 (括号内部未匹配到，删除对应内容，准备匹配外部内容)
static CLEAN_BRACKET_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\[[^\]]*\]|\([^\)]*\)|【[^】]*】|「[^」]*」").unwrap());

const CLEAN_PATTENS: &[(&str, &str)] = &[
    ("1", r"第(\d{1,4}(\.5)?)[集话話]"),
    ("2", r"([Ee][Pp]|[Ss][Pp]|[Ee])(\d{1,4}(\.5)?)"),
];

static CLEAN_EPISODE_RE: LazyLock<Vec<(usize, Regex)>> = LazyLock::new(|| {
    CLEAN_PATTENS
        .iter()
        .map(|(idx, p)| (idx.parse::<usize>().unwrap_or(1), Regex::new(p).unwrap()))
        .collect()
});

// 预编译：清理常见的干扰数字（分辨率、编码、位深等），防止污染最后的纯数字兜底
static CLEAN_TRASH_RE: LazyLock<Regex> = LazyLock::new(|| {
    // (?i) 表示忽略大小写
    // \b 表示单词边界，防止误伤类似 "avc" 但实际是 "havoc" 的单词
    Regex::new(r"(?i)\b(?:1080p|720p|2160p|4k|2k|8k|x264|x265|h264|h265|10bit|8bit)\b").unwrap()
});

// 匹配10v1,10.5v1...
static RE_V: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(\d+\.?5?)[Vv]\d+").unwrap());
// 匹配纯xx.5这种格式(前后不能有英文,最多只匹配到xxx.5)
static RE_DECIMAL: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\b\d{1,3}\.5\b").unwrap());
// 兜底匹配文件名最后的数字
static RE_LAST_DIGITS: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\d+").unwrap());

// 预编译正则：匹配季数
static SEASON_RE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^[Ss]\d{1,3}$").unwrap());

pub fn extract_episode(filename: &str) -> Option<String> {
    let path = Path::new(filename);

    // 获取文件名干 (不带后缀)
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(filename);

    // 检查忽略规则
    if ignore_rules(stem) {
        return None;
    }

    // 匹配括号内的内容 (使用预编译组合)
    for (idx, re) in COMBINED_EPISODE_RE.iter() {
        if let Some(caps) = re.captures(stem)
            && let Some(m) = caps.get(*idx)
        {
            return Some(m.as_str().to_string());
        }
    }

    // 括号内未匹配到，清洗括号内容
    let clean_filename = CLEAN_BRACKET_RE.replace_all(stem, "").to_string();

    // 匹配括号外的内容
    for (idx, re) in CLEAN_EPISODE_RE.iter() {
        if let Some(caps) = re.captures(&clean_filename)
            && let Some(m) = caps.get(*idx)
        {
            return Some(m.as_str().to_string());
        }
    }

    // 开始匹配纯数字兜底
    // 模式：10v1, 10.5v1
    if let Some(caps) = RE_V.captures(&clean_filename)
        && let Some(m) = caps.get(1)
    {
        return Some(m.as_str().to_string());
    }

    // 模式：纯xx.5这种格式(前后不能有英文,最多只匹配到xxx.5)
    if let Some(m) = RE_DECIMAL.find(&clean_filename) {
        return Some(m.as_str().to_string());
    }

    // 在兜底之前，先把 1080p, x265 这种干扰项从字符串中删掉
    let clean_for_digits = CLEAN_TRASH_RE.replace_all(&clean_filename, "");

    // 兜底模式：文件名最后的数字
    let matches: Vec<_> = RE_LAST_DIGITS.find_iter(&clean_for_digits).collect();
    if let Some(last_match) = matches.last() {
        return Some(last_match.as_str().to_string());
    }

    // 未匹配到
    None
}

pub fn rename_format(dir: &str, mut ep: String, ext: &str) -> String {
    // 补 0
    if ep.len() < 2 {
        ep.insert(0, '0');
    }

    if SEASON_RE.is_match(dir) {
        format!("{}E{}.{}", dir, ep, ext)
    } else {
        format!("S01E{}.{}", ep, ext)
    }
}

fn ignore_rules(stem: &str) -> bool {
    IGNORE_RE.iter().any(|re| re.is_match(stem))
}
