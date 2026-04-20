use std::sync::Arc;

use anyhow::Context;
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
    let items = tokio::task::spawn_blocking(move || sandbox.get_items(&params.path))
        .await
        .context("开启线程池")??;

    Ok((StatusCode::OK, Json(items)))
}

pub async fn get_dirs(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedQuery(params): ValidatedQuery<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    let dirs = tokio::task::spawn_blocking(move || sandbox.get_dirs(&params.path))
        .await
        .context("开启线程池")??;

    Ok((StatusCode::OK, Json(dirs)))
}

pub async fn create_dir(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<DirParams>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || sandbox.create_dir(&payload.path))
        .await
        .context("开启线程池")??;
    Ok(StatusCode::CREATED)
}

pub async fn delete_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<DeleteRequest>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || sandbox.delete_items(&payload.dir, &payload.targets))
        .await
        .context("开启线程池")??;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn copy_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<CopyRequest>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || {
        sandbox.copy_items(&payload.dir, &payload.target_dir, &payload.originals)
    })
    .await
    .context("开启线程池")??;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn move_items(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<MoveRequest>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || {
        sandbox.move_items(&payload.dir, &payload.target_dir, &payload.originals)
    })
    .await
    .context("开启线程池")??;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn rename_item(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenameRequest>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || {
        sandbox.rename_item(&payload.dir, payload.original_name, payload.target_name)
    })
    .await
    .context("开启线程池")??;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn rename_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenamePreviewRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names =
        tokio::task::spawn_blocking(move || sandbox.rename_preview(&payload.dir, payload.targets))
            .await
            .context("开启线程池")??;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn remove_strings_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RemoveStringsRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names = tokio::task::spawn_blocking(move || {
        sandbox.remove_strings(&payload.dir, payload.targets, payload.strings)
    })
    .await
    .context("开启线程池")??;

    Ok((StatusCode::OK, Json(names)))
}

pub async fn replace_chinese_preview(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<ReplaceChineseRequest>,
) -> Result<impl IntoResponse, AppError> {
    let names =
        tokio::task::spawn_blocking(move || sandbox.replace_chinese(&payload.dir, payload.targets))
            .await
            .context("开启线程池")??;
    Ok((StatusCode::OK, Json(names)))
}

pub async fn rename_confirm(
    State(sandbox): State<Arc<SandBox>>,
    ValidatedJson(payload): ValidatedJson<RenameConfirmRequest>,
) -> Result<impl IntoResponse, AppError> {
    tokio::task::spawn_blocking(move || {
        for entry in payload.name_maps {
            let target_path = payload.dir.join(entry.dir);
            sandbox.rename_files(&target_path, entry.files)?;
        }
        Ok::<(), AppError>(())
    })
    .await
    .context("开启线程池")??;

    Ok(StatusCode::NO_CONTENT)
}
