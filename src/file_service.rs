use std::{
    fs::{self},
    io,
    path::{Path, PathBuf},
};

use chrono::{DateTime, Local};
use fs_extra::{dir::CopyOptions, error::Error};
use human_bytes::human_bytes;
use pinyin::ToPinyin;
use uuid::Uuid;

use crate::models::{CopyRequest, DeleteRequest, File, MoveRequest};

pub fn delete_files(req: DeleteRequest) -> Result<(), Error> {
    let from_paths: Vec<PathBuf> = req
        .targets
        .iter()
        .map(|entry| Path::new(&req.dir).join(entry))
        .collect();
    fs_extra::remove_items(&from_paths)
}

pub fn copy_files(req: CopyRequest) -> Result<u64, Error> {
    let mut options = CopyOptions::new();
    // 不覆盖文件
    options.overwrite = false;
    let from_paths: Vec<PathBuf> = req
        .originals
        .iter()
        .map(|entry| Path::new(&req.dir).join(entry))
        .collect();

    fs_extra::copy_items(&from_paths, &req.target_dir, &options)
}

pub fn move_files(req: MoveRequest) -> Result<u64, Error> {
    let mut options = CopyOptions::new();
    options.overwrite = false;
    let from_paths: Vec<PathBuf> = req
        .originals
        .iter()
        .map(|entry| Path::new(&req.dir).join(entry))
        .collect();

    fs_extra::move_items(&from_paths, &req.target_dir, &options)
}

pub fn get_files<P>(dir: P) -> io::Result<Vec<File>>
where
    P: AsRef<Path>,
{
    let mut files = Vec::new();

    for entry in fs::read_dir(dir)? {
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
        let mtime: DateTime<Local> = metadata.modified()?.into();
        let mod_time = mtime.format("%Y-%m-%d %H:%M").to_string();
        files.push(File {
            id: Uuid::new_v4().to_string(),
            name,
            ext,
            size,
            is_dir,
            mod_time,
        });
    }

    // 排序：文件夹优先，英文/拼音首字母排序
    files.sort_by(|a, b| {
        // 当b是文件夹，a是文件，true>false 返回Greater，b会往前排
        // a.cmp(b)不行，false<true 返回Less，a靠前
        b.is_dir.cmp(&a.is_dir).then_with(|| {
            let a_p = get_pinyin_helper(&a.name);
            let b_p = get_pinyin_helper(&b.name);
            // 例如字母a,b，a比b小，返回Less，a靠前
            a_p.cmp(&b_p)
        })
    });

    Ok(files)
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
