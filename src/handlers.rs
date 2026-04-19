use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use crate::{
    error::AppError,
    extractors::{ValidatedJson, ValidatedQuery},
    file_service::SandBox,
    models::{
        CopyRequest, DeleteRequest, DirParams, MoveRequest, RemoveStringsRequest,
        RenameConfirmRequest, RenamePreviewRequest, RenameRequest, ReplaceChineseRequest,
    },
};

pub async fn health_check() -> &'static str {
    "Welcome to the Renamer!"
}

pub async fn get_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedQuery(params): ValidatedQuery<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    let items = sandbox.get_items(&params.path)?;
    Ok((StatusCode::OK, Json(items)))
}

pub async fn get_dirs(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedQuery(params): ValidatedQuery<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    let dirs = sandbox.get_dirs(&params.path)?;

    Ok((StatusCode::OK, Json(dirs)))
}

pub async fn create_dir(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    sandbox.create_dir(&payload.path)?;

    Ok(StatusCode::CREATED)
}

pub async fn delete_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<DeleteRequest>,
) -> Result<impl IntoResponse, AppError> {
    sandbox.delete_items(&payload.dir, &payload.targets)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn copy_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<CopyRequest>,
) -> Result<impl IntoResponse, AppError> {
    sandbox.copy_items(&payload.dir, &payload.target_dir, &payload.originals)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn move_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<MoveRequest>,
) -> Result<impl IntoResponse, AppError> {
    sandbox.move_items(&payload.dir, &payload.target_dir, &payload.originals)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn rename_item(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenameRequest>,
) -> Result<impl IntoResponse, AppError> {
    sandbox.rename_item(&payload.dir, payload.original_name, payload.target_name)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn rename_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenamePreviewRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = sandbox.rename_preview(&payload.dir, payload.targets)?;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn remove_strings_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RemoveStringsRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = sandbox.remove_strings(&payload.dir, payload.targets, payload.strings)?;

    Ok((StatusCode::OK, Json(names)))
}

pub async fn replace_chinese_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<ReplaceChineseRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = sandbox.replace_chinese(&payload.dir, payload.targets)?;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn rename_confirm(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenameConfirmRequest>,
) -> Result<impl IntoResponse, AppError> {
    for entry in payload.name_maps {
        let target_path = payload.dir.join(entry.dir);
        sandbox.rename_files(&target_path, entry.files)?;
    }

    Ok(StatusCode::NO_CONTENT)
}
