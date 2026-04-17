use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Deserialize, Validate)]
pub struct DirParams {
    pub path: PathBuf,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CopyRequest {
    pub dir: PathBuf,
    pub target_dir: PathBuf,
    #[validate(length(min = 1, message = "源文件列表不能为空"))]
    pub originals: Vec<String>,
}

pub type MoveRequest = CopyRequest;

#[derive(Deserialize, Validate)]
pub struct DeleteRequest {
    pub dir: PathBuf,
    #[validate(length(min = 1, message = "源文件列表不能为空"))]
    pub targets: Vec<String>,
}

pub type RenamePreviewRequest = DeleteRequest;
pub type ReplaceChineseRequest = DeleteRequest;

#[derive(Deserialize, Validate)]
pub struct RemoveStringsRequest {
    pub dir: PathBuf,
    #[validate(length(min = 1, message = "目标文件列表不能为空"))]
    pub targets: Vec<String>,
    #[validate(length(min = 1, message = "待移除的字符串不能为空"))]
    pub strings: Vec<String>,
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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Node {
    pub name: String,
    pub path: String,
    pub has_children: bool,
}
