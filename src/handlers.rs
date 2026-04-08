use std::{fs, io, path::Path};

use axum::{Json, http::StatusCode, response::IntoResponse};

use crate::{
    error::AppError,
    extractors::{ValidatedJson, ValidatedQuery},
    file_service,
    models::{
        CopyRequest, DeleteRequest, DirParams, MoveRequest, RemoveStringsRequest,
        RenameConfirmRequest, RenamePreviewRequest, ReplaceChineseRequest,
    },
    renamer,
};

pub async fn health_check() -> &'static str {
    "Welcome to the Renamer!"
}

pub async fn get_files(
    ValidatedQuery(params): ValidatedQuery<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    let files = file_service::get_files(&params.path)
        .map_err(|e| AppError::FileOpError("读取目录", params.path, e))?;
    Ok((StatusCode::OK, Json(files)))
}

pub async fn create_dir(
    ValidatedJson(payload): ValidatedJson<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    fs::create_dir(&payload.path).map_err(|e| {
        if e.kind() == io::ErrorKind::AlreadyExists {
            return AppError::AlreadyExists(payload.path);
        }
        AppError::FileOpError("创建文件夹", payload.path, e)
    })?;

    Ok(StatusCode::CREATED)
}

pub async fn delete_files(
    ValidatedJson(payload): ValidatedJson<DeleteRequest>,
) -> Result<impl IntoResponse, AppError> {
    file_service::delete_files(payload).map_err(|e| AppError::FsExtra("删除文件", e))?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn copy_files(
    ValidatedJson(payload): ValidatedJson<CopyRequest>,
) -> Result<impl IntoResponse, AppError> {
    file_service::copy_files(payload).map_err(|e| AppError::FsExtra("复制文件", e))?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn move_files(
    ValidatedJson(payload): ValidatedJson<MoveRequest>,
) -> Result<impl IntoResponse, AppError> {
    file_service::move_files(payload).map_err(|e| AppError::FsExtra("移动文件", e))?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn rename_preview(
    ValidatedJson(payload): ValidatedJson<RenamePreviewRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = renamer::rename_preview(payload).map_err(|e| AppError::IO("重命名预览", e))?;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn remove_strings_preview(
    ValidatedJson(payload): ValidatedJson<RemoveStringsRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = renamer::remove_strings(payload).map_err(|e| AppError::IO("移除字符串", e))?;

    Ok((StatusCode::OK, Json(names)))
}

pub async fn replace_chinese_preview(
    ValidatedJson(payload): ValidatedJson<ReplaceChineseRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = renamer::replace_chinese(payload).map_err(|e| AppError::IO("替换中文", e))?;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn rename_confirm(
    ValidatedJson(payload): ValidatedJson<RenameConfirmRequest>,
) -> Result<impl IntoResponse, AppError> {
    let base = Path::new(&payload.dir);
    for entry in payload.name_maps {
        renamer::rename_file(base.join(entry.dir), entry.files)
            .map_err(|e| AppError::IO("重命名文件", e))?;
    }
    Ok(StatusCode::NO_CONTENT)
}
