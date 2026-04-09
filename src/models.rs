use std::path::Path;

use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Deserialize, Validate)]
pub struct DirParams {
    #[validate(custom(function = "validate_path", message = "请输入合法路径"))]
    pub path: String,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CopyRequest {
    #[validate(custom(function = "validate_path", message = "请输入合法路径"))]
    pub dir: String,
    #[validate(custom(function = "validate_path", message = "目标路径不合法"))]
    pub target_dir: String,
    #[validate(length(min = 1, message = "源文件列表不能为空"))]
    pub originals: Vec<String>,
}

pub type MoveRequest = CopyRequest;

#[derive(Deserialize, Validate)]
pub struct DeleteRequest {
    #[validate(custom(function = "validate_path", message = "请输入合法路径"))]
    pub dir: String,
    #[validate(length(min = 1, message = "源文件列表不能为空"))]
    pub targets: Vec<String>,
}

pub type RenamePreviewRequest = DeleteRequest;
pub type ReplaceChineseRequest = DeleteRequest;

#[derive(Deserialize, Validate)]
pub struct RemoveStringsRequest {
    #[validate(custom(function = "validate_path", message = "请输入合法路径"))]
    pub dir: String,
    #[validate(length(min = 1, message = "目标文件列表不能为空"))]
    pub targets: Vec<String>,
    #[validate(length(min = 1, message = "待移除的字符串不能为空"))]
    pub strings: Vec<String>,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RenameConfirmRequest {
    #[validate(custom(function = "validate_path", message = "请输入合法路径"))]
    pub dir: String,
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
    #[validate(length(min = 1, message = "名称不能为空"))]
    pub old_name: String,
    #[validate(length(min = 1, message = "名称不能为空"))]
    pub new_name: String,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct NameMap {
    #[validate(length(min = 1, message = "目录名不能为空"))]
    pub dir: String,
    #[validate(nested)]
    pub files: Vec<Name>,
}

fn validate_path(path_str: &str) -> Result<(), ValidationError> {
    let path = Path::new(path_str);
    if path.is_absolute() {
        Ok(())
    } else {
        Err(ValidationError::new("invalid_path"))
    }
}
