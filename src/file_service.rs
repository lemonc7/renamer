use std::{collections::HashSet, io, path::Path, time};

use cap_std::{ambient_authority, fs::Dir};
use chrono::{DateTime, Local};
use human_bytes::human_bytes;
use pinyin::ToPinyin;
use uuid::Uuid;

use crate::{
    models::{File, Name, NameMap, Node},
    rules::{extract_episode, rename_format},
};

pub struct SandBox {
    root: Dir,
    match_exts: Vec<String>,
}

impl SandBox {
    pub fn init(base: String, match_exts: Vec<String>) -> Self {
        let root = Dir::open_ambient_dir(&base, ambient_authority())
            .unwrap_or_else(|_| panic!("基础目录必须存在且可访问: {}", base));
        Self { root, match_exts }
    }

    pub fn get_items(&self, dir: &Path) -> io::Result<Vec<File>> {
        let mut items = Vec::new();
        let dir_handle = self.root.open_dir(dir)?;
        for entry in dir_handle.entries()? {
            let entry = entry?;
            let metadata = entry.metadata()?;

            let is_dir = metadata.is_dir();
            let name = entry.file_name().to_string_lossy().into_owned();
            let path_ref = Path::new(&name);
            let (size, ext) = if is_dir {
                (None, None)
            } else {
                let s = human_bytes(metadata.len() as f64);
                let ext = path_ref
                    .extension()
                    .and_then(|s| s.to_str())
                    .map(|s| s.to_lowercase());
                (Some(s), ext)
            };
            let mod_time = metadata
                .modified()
                .map(|t| {
                    let std_time = t.into_std();
                    let dt: DateTime<Local> = std_time.into();
                    dt.format("%Y/%m/%d %H:%M").to_string()
                })
                .unwrap_or_else(|_| "未知".to_string());
            items.push(File {
                id: Uuid::new_v4().to_string(),
                name,
                ext,
                size,
                is_dir,
                mod_time,
            });
        }

        // 排序：文件夹优先，英文/拼音首字母排序
        items.sort_by(|a, b| {
            // 当b是文件夹，a是文件，true>false 返回Greater，b会往前排
            // a.cmp(b)不行，false<true 返回Less，a靠前
            b.is_dir.cmp(&a.is_dir).then_with(|| {
                let a_p = get_pinyin_helper(&a.name);
                let b_p = get_pinyin_helper(&b.name);
                // 例如字母a,b，a比b小，返回Less，a靠前
                a_p.cmp(&b_p)
            })
        });

        Ok(items)
    }

    pub fn get_dirs(&self, dir: &Path) -> io::Result<Vec<Node>> {
        let mut dirs = Vec::new();
        let dir_handle = self.root.open_dir(dir)?;

        for entry in dir_handle.entries()? {
            let entry = entry?;
            let metadata = entry.metadata()?;

            if !metadata.is_dir() {
                continue;
            }

            let name = entry.file_name().to_string_lossy().into_owned();
            let parent = dir.join(&name);
            let path = parent.to_string_lossy().replace("\\", "/");
            let has_children = self.has_sub_dirs(&parent)?;
            dirs.push(Node {
                name,
                path,
                has_children,
            });
        }

        dirs.sort_by(|a, b| {
            let a_p = get_pinyin_helper(&a.name);
            let b_p = get_pinyin_helper(&b.name);
            a_p.cmp(&b_p)
        });

        Ok(dirs)
    }

    pub fn get_pending_files(&self, dir: &Path) -> io::Result<Vec<File>> {
        let mut files = self.get_items(dir)?;
        files.retain(|f| !f.is_dir && f.ext.as_ref().is_some_and(|e| self.match_exts.contains(e)));

        Ok(files)
    }

    pub fn create_dir(&self, dir: &Path) -> io::Result<()> {
        if self.root.exists(dir) {
            return Err(io::Error::new(io::ErrorKind::AlreadyExists, "目录已存在"));
        }

        self.root.create_dir_all(dir)
    }

    pub fn delete_items(&self, dir: &Path, filenames: &[String]) -> io::Result<()> {
        // 进入指定的子目录(同样受沙盒保护)
        let dir_handle = self.root.open_dir(dir)?;

        for name in filenames {
            // sub_dir 句柄无法越界(可以防止路径穿越等错误)
            let meta = dir_handle.symlink_metadata(name)?;

            if meta.is_dir() {
                // 递归删除
                dir_handle.remove_dir_all(name)?;
            } else {
                // 文件或软链接，直接删除
                dir_handle.remove_file(name)?;
            }
        }

        Ok(())
    }

    pub fn copy_items(
        &self,
        from_dir: &Path,
        target_dir: &Path,
        filenames: &[String],
    ) -> io::Result<()> {
        let src_handle = self.root.open_dir(from_dir)?;
        let dst_handle = self.root.open_dir(target_dir)?;
        for name in filenames {
            let meta = src_handle.symlink_metadata(name)?;

            if meta.is_dir() {
                // 如果是目录，递归拷贝
                // 需要先创建目录
                dst_handle.create_dir_all(name)?;
                let sub_src = src_handle.open_dir(name)?;
                let sub_dst = dst_handle.open_dir(name)?;
                self.copy_dir_recursive(&sub_src, &sub_dst)?;
            } else {
                src_handle.copy(name, &dst_handle, name)?;
            }
        }

        Ok(())
    }

    pub fn move_items(
        &self,
        from_dir: &Path,
        target_dir: &Path,
        filenames: &[String],
    ) -> io::Result<()> {
        let src_handle = self.root.open_dir(from_dir)?;
        let dst_handle = self.root.open_dir(target_dir)?;

        for name in filenames {
            match src_handle.rename(name, &dst_handle, name) {
                Ok(_) => {}
                // 如果是跨分区错误
                Err(e)
                    if e.raw_os_error() == Some(18)
                        || e.kind() == io::ErrorKind::CrossesDevices =>
                {
                    self.fallback_move(&src_handle, &dst_handle, name)?;
                }
                Err(e) => return Err(e),
            }
        }
        Ok(())
    }

    pub fn rename_item(
        &self,
        dir: &Path,
        original_name: String,
        target_name: String,
    ) -> io::Result<()> {
        let dir_handle = self.root.open_dir(dir)?;

        if dir_handle.try_exists(&target_name)? {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                format!("目标名称已存在: {}", target_name),
            ));
        }

        dir_handle.rename(original_name, &dir_handle, target_name)
    }

    pub fn rename_preview(&self, dir: &Path, targets: Vec<String>) -> io::Result<Vec<NameMap>> {
        let mut name_maps = Vec::new();

        for entry in targets {
            let target_path = dir.join(&entry);
            let files = self.get_pending_files(&target_path)?;

            let mut names = Vec::new();
            for file in files {
                let new_name = if let Some(ep) = extract_episode(&file.name) {
                    rename_format(&entry, ep, file.ext.as_deref().unwrap_or_default())
                } else {
                    file.name.clone()
                };

                names.push(Name {
                    old_name: file.name,
                    new_name,
                });
            }
            name_maps.push(NameMap {
                dir: entry,
                files: names,
            });
        }

        Ok(name_maps)
    }

    pub fn remove_strings(
        &self,
        dir: &Path,
        targets: Vec<String>,
        strings: Vec<String>,
    ) -> io::Result<Vec<NameMap>> {
        let mut name_maps = Vec::new();

        for entry in targets {
            let target_path = dir.join(&entry);
            let items = self.get_items(&target_path)?;

            let mut names = Vec::new();
            for item in items {
                if !item.is_dir {
                    // 提取主文件名
                    let stem = if let Some(ref ext) = item.ext {
                        let end = item.name.len().saturating_sub(ext.len() + 1);
                        &item.name[..end]
                    } else {
                        &item.name
                    };

                    // 对主文件名进行替换
                    let mut new_stem = stem.to_string();
                    for s in &strings {
                        new_stem = new_stem.replace(s, "")
                    }

                    // 拼接后缀
                    let new_name = if let Some(ref ext) = item.ext {
                        format!("{}.{}", new_stem, ext)
                    } else {
                        new_stem
                    };

                    names.push(Name {
                        old_name: item.name,
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

    pub fn replace_chinese(&self, dir: &Path, targets: Vec<String>) -> io::Result<Vec<NameMap>> {
        let mut name_maps = Vec::new();

        for entry in targets {
            let target_path = dir.join(&entry);
            let items = self.get_items(&target_path)?;

            let mut names = Vec::new();
            for item in items {
                if !item.is_dir {
                    let new_name = convert_to_pinyin(&item.name);
                    names.push(Name {
                        old_name: item.name,
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

    pub fn rename_files(&self, dir: &Path, names: Vec<Name>) -> io::Result<()> {
        let dir_handle = self.root.open_dir(dir)?;

        Self::check_names(&names)?;

        let tasks: Vec<_> = names
            .into_iter()
            .filter(|n| n.old_name != n.new_name)
            .collect();

        if tasks.is_empty() {
            return Ok(());
        }

        let suffix = time::SystemTime::now()
            .duration_since(time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();

        // 使用 progress 记录进度，方便后续回滚
        let mut progress = 0;

        // 移动到临时备份
        for entry in &tasks {
            let tmp_name = format!("{}.{}.tmp", entry.old_name, suffix);
            dir_handle
                .rename(&entry.old_name, &dir_handle, &tmp_name)
                .inspect_err(|_e| {
                    self.rollback(&dir_handle, &tasks, progress, 1, suffix);
                })?;
            progress += 1
        }

        // 移动到最终目标
        progress = 0; // 重置进度用于 2 阶段
        for entry in &tasks {
            let tmp_name = format!("{}.{}.tmp", entry.old_name, suffix);

            if dir_handle.exists(&entry.new_name) {
                self.rollback(&dir_handle, &tasks, progress, 2, suffix);
                return Err(io::Error::new(
                    io::ErrorKind::AlreadyExists,
                    format!("目标已存在: {}", entry.new_name),
                ));
            }

            dir_handle
                .rename(&tmp_name, &dir_handle, &entry.new_name)
                .inspect_err(|_e| {
                    self.rollback(&dir_handle, &tasks, progress, 2, suffix);
                })?;
            progress += 1
        }

        Ok(())
    }

    fn rollback(&self, dir: &Dir, tasks: &[Name], progress: usize, phase: u8, suffix: u128) {
        if phase == 2 {
            // 如果在阶段 2 出错，先把阶段 2 已经完成的改回去
            for entry in tasks[..progress].iter().rev() {
                let tmp_name = format!("{}.{}.tmp", entry.old_name, suffix);
                let _ = dir.rename(&entry.new_name, dir, &tmp_name);
            }
            // 然后统一走阶段 1 的回滚 (此时所有文件就是 .tmp 的状态)
            self.rollback(dir, tasks, tasks.len(), 1, suffix);
        } else {
            // 阶段 1 的回滚，把 tmp 改回 old
            for entry in tasks[..progress].iter().rev() {
                let tmp_name = format!("{}.{}.tmp", entry.old_name, suffix);
                let _ = dir.rename(&tmp_name, dir, &entry.old_name);
            }
        }
    }

    fn check_names(names: &[Name]) -> io::Result<()> {
        let mut set = HashSet::with_capacity(names.len());

        for entry in names {
            let new_name = &entry.new_name;
            let old_name = &entry.old_name;

            // 合法性校验
            if !is_valid_filename(new_name) || !is_valid_filename(old_name) {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidInput,
                    format!("文件名非法: '{}' 或 '{}'", new_name, old_name),
                ));
            }

            // 目标重名校验
            if !set.insert(new_name) {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidInput,
                    format!("文件名重复: '{}'", new_name),
                ));
            }
        }

        Ok(())
    }

    fn copy_dir_recursive(&self, src: &Dir, dst: &Dir) -> io::Result<()> {
        for entry in src.entries()? {
            let entry = entry?;
            let name = entry.file_name();
            let meta = entry.metadata()?;

            if meta.is_dir() {
                dst.create_dir_all(&name)?;
                let next_src = src.open_dir(&name)?;
                let next_dst = dst.open_dir(&name)?;
                self.copy_dir_recursive(&next_src, &next_dst)?;
            } else {
                src.copy(&name, dst, &name)?;
            }
        }

        Ok(())
    }

    // 跨分区移动时，降级处理：先移动，再删除
    fn fallback_move(&self, src: &Dir, dst: &Dir, name: &str) -> io::Result<()> {
        let meta = src.symlink_metadata(name)?;
        if meta.is_dir() {
            dst.create_dir_all(name)?;
            let sub_src = src.open_dir(name)?;
            let sub_dst = dst.open_dir(name)?;
            // 先拷贝
            self.copy_dir_recursive(&sub_src, &sub_dst)?;
            // 再删除源目录
            src.remove_dir_all(name)?;
        } else {
            src.copy(name, dst, name)?;
            src.remove_file(name)?;
        }

        Ok(())
    }

    fn has_sub_dirs(&self, dir: &Path) -> io::Result<bool> {
        let dir_handle = match self.root.open_dir(dir) {
            Ok(d) => d,
            Err(_) => return Ok(false),
        };

        for entry in dir_handle.entries()? {
            if entry?.metadata()?.is_dir() {
                return Ok(true);
            }
        }
        Ok(false)
    }
}

// 将中文转化为拼音，英文转化为小写
fn get_pinyin_helper(s: &str) -> String {
    let mut pinyin_str = String::new();
    for c in s.chars() {
        if let Some(p) = c.to_pinyin() {
            pinyin_str.push_str(p.plain());
        } else {
            pinyin_str.push(c.to_ascii_lowercase());
        }
    }
    pinyin_str
}

fn is_valid_filename(name: &str) -> bool {
    let trimmed = name.trim();
    // 不允许空名字，包含路径分隔符，当前或父目录表示
    !trimmed.is_empty()
        && !name.contains('/')
        && !name.contains('\\')
        && name != "."
        && name != ".."
}

// 将中文字符串转换为拼音，并替换标点
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
