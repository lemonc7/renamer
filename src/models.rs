use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Deserialize, Validate)]
pub struct DirParams {
    pub path: PathBuf,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CopyRequest {
    pub dir: PathBuf,
    pub target_dir: PathBuf,
    #[validate(
        length(min = 1, message = "源文件列表不能为空"),
        custom(function = "validate_filename_list", message = "存在非法文件名")
    )]
    pub originals: Vec<String>,
}

pub type MoveRequest = CopyRequest;

#[derive(Deserialize, Validate)]
pub struct DeleteRequest {
    pub dir: PathBuf,
    #[validate(
        length(min = 1, message = "目标文件列表不能为空"),
        custom(function = "validate_filename_list", message = "存在非法文件名")
    )]
    pub targets: Vec<String>,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RenameRequest {
    pub dir: PathBuf,
    #[validate(custom(function = "validate_filename", message = "原名称非法"))]
    pub original_name: String,
    #[validate(custom(function = "validate_filename", message = "目标名称非法"))]
    pub target_name: String,
}

pub type RenamePreviewRequest = DeleteRequest;
pub type ReplaceChineseRequest = DeleteRequest;

#[derive(Deserialize, Validate)]
pub struct RemoveStringsRequest {
    pub dir: PathBuf,
    #[validate(
        length(min = 1, message = "目标文件列表不能为空"),
        custom(function = "validate_filename_list", message = "存在非法文件名")
    )]
    pub targets: Vec<String>,
    #[validate(length(min = 1, message = "待移除的字符串不能为空"))]
    pub strings: Vec<String>,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UnifySeriesRequest {
    pub dir: PathBuf,
    #[validate(custom(function = "validate_filename", message = "剧集名称非法"))]
    pub series_name: String,
    #[validate(length(min = 1, message = "待整理的季数不能为空"), nested)]
    pub season_names: Vec<Name>,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RenameConfirmRequest {
    pub dir: PathBuf,
    #[validate(length(min = 1, message = "没有需要重命名的目录"), nested)]
    pub name_maps: Vec<NameMap>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct File {
    pub id: String,
    pub name: String,
    pub ext: Option<String>,
    pub size: Option<String>,
    pub is_dir: bool,
    pub mod_time: String,
}

#[derive(Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Name {
    #[validate(custom(function = "validate_filename", message = "原名称非法"))]
    pub old_name: String,
    #[validate(custom(function = "validate_filename", message = "新名称非法"))]
    pub new_name: String,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct NameMap {
    #[validate(custom(function = "validate_filename", message = "目录名非法"))]
    pub dir: String,
    #[validate(length(min = 1, message = "待重命名的文件列表不能为空"), nested)]
    pub files: Vec<Name>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Node {
    pub name: String,
    pub path: String,
    pub has_children: bool,
}

const INVALID_CHARS: [char; 9] = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

fn validate_filename(name: &str) -> Result<(), ValidationError> {
    // 检查是否为空或全是空格
    if name.trim().is_empty() {
        return Err(ValidationError::new("empty filename"));
    }
    // 拦截不可见控制字符和非法字符
    if name
        .chars()
        .any(|c| c.is_control() || INVALID_CHARS.contains(&c))
    {
        return Err(ValidationError::new("invalid characters"));
    }

    Ok(())
}

fn validate_filename_list(names: &Vec<String>) -> Result<(), ValidationError> {
    for name in names {
        validate_filename(name)?;
    }
    Ok(())
}
