use std::{
    collections::HashSet,
    fs,
    io::{self, ErrorKind},
    path::{Path, PathBuf},
    sync::LazyLock,
    time::{SystemTime, UNIX_EPOCH},
};

use pinyin::ToPinyin;
use regex::Regex;

use crate::{
    file_service::{get_files, resolve_path},
    models::{
        File, Name, NameMap, RemoveStringsRequest, RenamePreviewRequest, ReplaceChineseRequest,
    },
};

const MATCH_EXTS: &[&str] = &[
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

pub fn rename_preview(req: RenamePreviewRequest) -> io::Result<Vec<NameMap>> {
    let mut name_maps = Vec::new();

    for entry in req.targets {
        let mut names = Vec::new();
        let files = get_pending_files(req.dir.join(&entry))?;

        for file in files {
            match extract_episode(&file.name) {
                Some(ep) => {
                    let new_name =
                        rename_format(&entry, ep, file.ext.as_deref().unwrap_or_default());
                    names.push(Name {
                        old_name: file.name,
                        new_name,
                    });
                }
                None => {
                    names.push(Name {
                        old_name: file.name.clone(),
                        new_name: file.name,
                    });
                }
            }
        }
        name_maps.push(NameMap {
            dir: entry,
            files: names,
        });
    }
    Ok(name_maps)
}

pub fn remove_strings(req: RemoveStringsRequest) -> io::Result<Vec<NameMap>> {
    let mut name_maps = Vec::new();

    for entry in req.targets {
        let target_path = req.dir.join(&entry);
        let files = get_files(target_path)?;
        let mut names = Vec::new();

        for file in files {
            if !file.is_dir {
                let mut new_name = file.name.clone();
                for s in &req.strings {
                    new_name = new_name.replace(s, "");
                }
                names.push(Name {
                    old_name: file.name,
                    new_name,
                });
            }
        }

        name_maps.push(NameMap {
            dir: entry,
            files: names,
        });
    }

    Ok(name_maps)
}

pub fn replace_chinese(req: ReplaceChineseRequest) -> io::Result<Vec<NameMap>> {
    let mut name_maps = Vec::new();

    for entry in req.targets {
        let target_path = req.dir.join(&entry);
        let files = get_files(target_path)?;
        let mut names = Vec::new();

        for file in files {
            if !file.is_dir {
                let new_name = convert_to_pinyin(&file.name);
                names.push(Name {
                    old_name: file.name,
                    new_name,
                });
            }
        }
        name_maps.push(NameMap {
            dir: entry,
            files: names,
        });
    }

    Ok(name_maps)
}

// 批量重命名，出错会尝试回滚
pub fn rename_file<P>(path: P, names: Vec<Name>) -> io::Result<()>
where
    P: AsRef<Path>,
{
    let base = resolve_path(path.as_ref())?;
    // 检查文件名是否合法
    check_names(&names)?;

    // 生成唯一后缀
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    // 记录状态用于回滚
    let mut phase1_done = Vec::new();
    let mut phase2_done = Vec::new();

    // 将目标重命名为临时文件
    for entry in &names {
        if entry.new_name != entry.old_name {
            let old_path = base.join(&entry.old_name);
            let tmp_path = base.join(format!("{}.{}.tmp", entry.old_name, suffix));
            if let Err(e) = fs::rename(&old_path, &tmp_path) {
                rollback(phase1_done, phase2_done);
                return Err(io::Error::new(
                    e.kind(),
                    format!("重命名为临时文件失败 ({:?}): {}", old_path, e),
                ));
            }
            phase1_done.push((tmp_path, old_path));
        }
    }

    // 将临时文件重命名为目标文件
    for (entry, (tmp_path, _)) in names.iter().zip(phase1_done.iter()) {
        if entry.new_name != entry.old_name {
            let final_path: PathBuf = base.join(&entry.new_name);
            // 显式检查最终文件是否存在 (已经排除了需要重命名的文件-临时文件)
            // fs::rename 平台在 linux/macos 上会覆盖，不报错
            if final_path.exists() {
                rollback(phase1_done, phase2_done);
                return Err(io::Error::new(
                    ErrorKind::AlreadyExists,
                    format!("目标文件已存在: {:?}", final_path),
                ));
            }

            if let Err(e) = fs::rename(tmp_path, &final_path) {
                rollback(phase1_done, phase2_done);
                return Err(io::Error::new(
                    e.kind(),
                    format!("重命名为最终文件失败 ({:?}): {}", final_path, e),
                ));
            }
            phase2_done.push((final_path, tmp_path.clone()));
        }
    }
    Ok(())
}

fn get_pending_files<P>(path: P) -> io::Result<Vec<File>>
where
    P: AsRef<Path>,
{
    let mut files = get_files(path)?;

    files.retain(|f| !f.is_dir && f.ext.as_deref().is_some_and(|e| MATCH_EXTS.contains(&e)));

    Ok(files)
}

fn ignore_rules(stem: &str) -> bool {
    IGNORE_RE.iter().any(|re| re.is_match(stem))
}

fn extract_episode(filename: &str) -> Option<String> {
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

fn rename_format(dir: &str, mut ep: String, ext: &str) -> String {
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

fn check_names(names: &[Name]) -> io::Result<()> {
    let mut set = HashSet::new();
    for entry in names {
        let new_name = entry.new_name.as_str();
        if !is_valid_filename(new_name) || !is_valid_filename(&entry.old_name) {
            return Err(io::Error::new(
                ErrorKind::InvalidFilename,
                "存在非法的文件名",
            ));
        }
        if !set.insert(new_name) {
            return Err(io::Error::new(
                ErrorKind::InvalidInput,
                format!("存在重名的文件名: {}", new_name),
            ));
        }
    }
    Ok(())
}

// 回滚重命名操作：逆序
fn rollback(phase1_done: Vec<(PathBuf, PathBuf)>, phase2_done: Vec<(PathBuf, PathBuf)>) {
    for (final_path, tmp_path) in phase2_done.into_iter().rev() {
        let _ = fs::rename(final_path, tmp_path);
    }

    for (tmp_path, old_path) in phase1_done.into_iter().rev() {
        let _ = fs::rename(tmp_path, old_path);
    }
}

/// 将中文字符串转换为拼音，并替换标点
fn convert_to_pinyin(s: &str) -> String {
    let mut result = String::with_capacity(s.len());

    for c in s.chars() {
        // 理标点符号映射
        let punct = match c {
            '，' | '、' => Some(","),
            '。' => Some("."),
            '！' => Some("!"),
            '？' => Some("?"),
            '；' => Some(";"),
            '：' => Some(":"),
            '（' => Some("("),
            '）' => Some(")"),
            '【' => Some("["),
            '】' => Some("]"),
            '“' | '”' => Some("\""),
            '‘' | '’' => Some("'"),
            '—' => Some("-"),
            '…' => Some("..."),
            _ => None,
        };

        if let Some(p) = punct {
            result.push_str(p);
            continue;
        }

        // 尝试转拼音 (针对汉字)
        // pinyin crate 提供了为 char 实现的 trait
        if let Some(py) = c.to_pinyin() {
            result.push_str(py.plain());
            continue;
        }

        // 原样保留（非汉字、非映射标点）
        result.push(c);
    }
    result
}

fn is_valid_filename(name: &str) -> bool {
    !name.contains('/') && !name.contains('\\')
}
