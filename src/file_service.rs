use std::{collections::HashSet, io, path::Path, time};

use anyhow::{Context, anyhow};
use cap_std::{ambient_authority, fs::Dir};
use chrono::{DateTime, Local};
use human_bytes::human_bytes;
use pinyin::ToPinyin;
use uuid::Uuid;

use crate::{
    error::AppError,
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

    pub fn get_items(&self, dir: &Path) -> Result<Vec<File>, AppError> {
        let dir_handle = self.open_dir(dir)?;

        let mut items: Vec<File> = dir_handle
            .entries()
            .context("读取目录内容")?
            .filter_map(|entry_res| {
                let entry = entry_res.ok()?;
                let metadata = entry.metadata().ok()?;
                let is_dir = metadata.is_dir();
                let name = entry.file_name().to_string_lossy().into_owned();

                let (size, ext) = if is_dir {
                    (None, None)
                } else {
                    let s = human_bytes(metadata.len() as f64);
                    let extension = Path::new(&name)
                        .extension()
                        .and_then(|s| s.to_str())
                        .map(|s| s.to_lowercase());
                    (Some(s), extension)
                };

                let mod_time = metadata
                    .modified()
                    .map(|t| {
                        let std_time = t.into_std();
                        let dt: DateTime<Local> = std_time.into();
                        dt.format("%Y/%m/%d %H:%M").to_string()
                    })
                    .unwrap_or_else(|_| "未知".to_string());

                Some(File {
                    id: Uuid::new_v4().to_string(),
                    name,
                    ext,
                    size,
                    is_dir,
                    mod_time,
                })
            })
            .collect();

        // 从小到大排序，并使用缓存，避免重复计算pinyin：文件夹(false) < 文件(true)
        items.sort_by_cached_key(|f| (!f.is_dir, get_pinyin_helper(&f.name)));

        Ok(items)
    }

    pub fn get_dirs(&self, dir: &Path) -> Result<Vec<Node>, AppError> {
        let dir_handle = self.open_dir(dir)?;

        let mut dirs: Vec<Node> = dir_handle
            .entries()
            .context("读取目录内容")?
            .filter_map(|entry_res| {
                let entry = entry_res.ok()?;
                let metadata = entry.metadata().ok()?;

                if !metadata.is_dir() {
                    return None;
                }

                let name = entry.file_name().to_string_lossy().into_owned();
                let parent = dir.join(&name);
                let path = parent.to_string_lossy().replace("\\", "/");
                let has_children = self.has_sub_dirs(&parent).ok()?;
                Some(Node {
                    name,
                    path,
                    has_children,
                })
            })
            .collect();

        dirs.sort_by_cached_key(|f| get_pinyin_helper(&f.name));

        Ok(dirs)
    }

    pub fn get_pending_files(&self, dir: &Path) -> Result<Vec<File>, AppError> {
        let mut files = self.get_items(dir)?;
        files.retain(|f| !f.is_dir && f.ext.as_ref().is_some_and(|e| self.match_exts.contains(e)));

        Ok(files)
    }

    pub fn create_dir(&self, dir: &Path) -> Result<(), AppError> {
        if self.root.exists(dir) {
            return Err(AppError::AlreadyExists(dir.to_path_buf()));
        }

        self.root
            .create_dir_all(dir)
            .context(format!("创建目录: {:?}", dir))?;
        Ok(())
    }

    pub fn delete_items(&self, dir: &Path, filenames: &[String]) -> Result<(), AppError> {
        // 进入指定的子目录(同样受沙盒保护)
        let dir_handle = self.open_dir(dir)?;

        for name in filenames {
            // sub_dir 句柄无法越界(可以防止路径穿越等错误)
            let meta = dir_handle.symlink_metadata(name).context("路径越界")?;

            if meta.is_dir() {
                // 递归删除
                dir_handle.remove_dir_all(name).context("删除文件夹")?;
            } else {
                // 文件或软链接，直接删除
                dir_handle.remove_file(name).context("删除文件")?;
            }
        }

        Ok(())
    }

    pub fn copy_items(
        &self,
        from_dir: &Path,
        target_dir: &Path,
        filenames: &[String],
    ) -> Result<(), AppError> {
        let src_handle = self.open_dir(from_dir)?;
        let dst_handle = self.open_dir(target_dir)?;
        for name in filenames {
            let meta = src_handle.symlink_metadata(name).context("路径越界")?;

            if meta.is_dir() {
                // 如果是目录，递归拷贝
                // 需要先创建目录
                dst_handle.create_dir_all(name).context("创建目录")?;
                let sub_src = src_handle.open_dir(name).context("打开子目录")?;
                let sub_dst = dst_handle.open_dir(name).context("打开目标子目录")?;
                self.copy_dir_recursive(&sub_src, &sub_dst)?;
            } else {
                src_handle
                    .copy(name, &dst_handle, name)
                    .context("复制文件")?;
            }
        }

        Ok(())
    }

    pub fn move_items(
        &self,
        from_dir: &Path,
        target_dir: &Path,
        filenames: &[String],
    ) -> Result<(), AppError> {
        let src_handle = self.open_dir(from_dir)?;
        let dst_handle = self.open_dir(target_dir)?;

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
                Err(e) => {
                    return Err(AppError::Internal(anyhow!("移动文件 {}: {}", name, e)));
                }
            }
        }
        Ok(())
    }

    pub fn rename_item(
        &self,
        dir: &Path,
        original_name: String,
        target_name: String,
    ) -> Result<(), AppError> {
        let dir_handle = self.open_dir(dir)?;

        if dir_handle
            .try_exists(&target_name)
            .context("读取目标文件(夹)")?
        {
            return Err(AppError::AlreadyExists(dir.join(&target_name)));
        }

        dir_handle
            .rename(original_name, &dir_handle, target_name)
            .context("重命名文件(夹)")?;
        Ok(())
    }

    pub fn rename_preview(
        &self,
        dir: &Path,
        targets: Vec<String>,
    ) -> Result<Vec<NameMap>, AppError> {
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
    ) -> Result<Vec<NameMap>, AppError> {
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

    pub fn replace_chinese(
        &self,
        dir: &Path,
        targets: Vec<String>,
    ) -> Result<Vec<NameMap>, AppError> {
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

    pub fn rename_files(&self, dir: &Path, names: Vec<Name>) -> Result<(), AppError> {
        let dir_handle = self.open_dir(dir)?;

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
                .map_err(|e| {
                    self.rollback(&dir_handle, &tasks, progress, 1, suffix);
                    AppError::Internal(anyhow!("重命名至临时文件: {}", e))
                })?;
            progress += 1
        }

        // 移动到最终目标
        progress = 0; // 重置进度用于 2 阶段
        for entry in &tasks {
            let tmp_name = format!("{}.{}.tmp", entry.old_name, suffix);

            if dir_handle.exists(&entry.new_name) {
                self.rollback(&dir_handle, &tasks, progress, 2, suffix);
                return Err(AppError::AlreadyExists(dir.join(&entry.new_name)));
            }

            dir_handle
                .rename(&tmp_name, &dir_handle, &entry.new_name)
                .map_err(|e| {
                    self.rollback(&dir_handle, &tasks, progress, 2, suffix);
                    AppError::Internal(anyhow!("重命名至最终文件: {}", e))
                })?;
            progress += 1
        }

        Ok(())
    }

    pub fn tidy_series(
        &self,
        dir: &Path,
        series_name: String,
        season_names: Vec<Name>,
    ) -> Result<(), AppError> {
        let src_handle = self.open_dir(dir)?;
        Self::check_names(&season_names)?;

        let suffix = time::SystemTime::now()
            .duration_since(time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let tmp_name = format!("{}_{}", series_name, suffix);
        let tmp_path = dir.join(&tmp_name);

        // 创建对应剧集文件夹
        src_handle
            .create_dir(&tmp_name)
            .context(format!("创建临时目录: {tmp_name}"))?;
        let dst_handle = self.open_dir(&tmp_path)?;

        // 移动重命名对应的 season
        for season in season_names {
            src_handle
                .rename(&season.old_name, &dst_handle, season.new_name)
                .context(format!("整理季数: {}", season.old_name))?;
        }

        // 检查最终目标目录是否存在
        if src_handle
            .try_exists(&series_name)
            .context(format!("读取目录: {series_name}"))?
        {
            return Err(AppError::Internal(anyhow!(
                "剧集名已存在，已整理至临时目录，请手动处理: {tmp_name}"
            )));
        }
        // 重命名为正式名称
        src_handle
            .rename(&tmp_name, &src_handle, series_name)
            .context(format!("将临时目录重命名至正式剧集失败: {tmp_name}"))?;
        Ok(())
    }

    fn open_dir(&self, dir: &Path) -> Result<Dir, AppError> {
        self.root.open_dir(dir).map_err(|e| {
            if e.kind() == io::ErrorKind::NotFound {
                AppError::NotFound(dir.to_path_buf())
            } else {
                AppError::Internal(anyhow!("打开目录 {:?}: {}", dir, e))
            }
        })
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

    fn check_names(names: &[Name]) -> Result<(), AppError> {
        let mut set = HashSet::with_capacity(names.len());

        for entry in names {
            let new_name = &entry.new_name;
            let old_name = &entry.old_name;

            // 合法性校验
            if !is_valid_filename(new_name) || !is_valid_filename(old_name) {
                return Err(AppError::BadRequest(format!(
                    "文件名非法: '{}' 或 '{}'",
                    new_name, old_name
                )));
            }

            // 目标重名校验
            if !set.insert(new_name) {
                return Err(AppError::BadRequest(format!("文件名重复: '{}'", new_name)));
            }
        }

        Ok(())
    }

    fn copy_dir_recursive(&self, src: &Dir, dst: &Dir) -> Result<(), AppError> {
        for entry_res in src.entries().context("读取目录内容")? {
            let entry = entry_res.context("获取entry信息")?;
            let name = entry.file_name();
            let meta = entry.metadata().context("获取metadata")?;

            if meta.is_dir() {
                dst.create_dir_all(&name).context("创建目录")?;
                let next_src = src.open_dir(&name).context("打开下一级目录")?;
                let next_dst = dst.open_dir(&name).context("打开下一级目标目录")?;
                self.copy_dir_recursive(&next_src, &next_dst)?;
            } else {
                src.copy(&name, dst, &name).context("复制文件")?;
            }
        }

        Ok(())
    }

    // 跨分区移动时，降级处理：先移动，再删除
    fn fallback_move(&self, src: &Dir, dst: &Dir, name: &str) -> Result<(), AppError> {
        let meta = src.symlink_metadata(name).context("路径越界")?;
        if meta.is_dir() {
            dst.create_dir_all(name).context("创建目录")?;
            let sub_src = src.open_dir(name).context("打开子目录")?;
            let sub_dst = dst.open_dir(name).context("打开目标子目录")?;
            // 先拷贝
            self.copy_dir_recursive(&sub_src, &sub_dst)?;
            // 再删除源目录
            src.remove_dir_all(name).context("删除源目录")?;
        } else {
            src.copy(name, dst, name).context("复制文件")?;
            src.remove_file(name).context("删除源文件")?;
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
