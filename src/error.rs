use std::{collections::HashMap, path};

use axum::{Json, http::StatusCode, response::IntoResponse};
use serde_json::{Value, json};
use thiserror::Error;
use tracing::Span;
use validator::ValidationErrors;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("参数校验失败: \n{0}")]
    ValidationError(#[source] ValidationErrors),
    #[error("请求参数有误: {0}")]
    BadRequest(String),
    #[error("目标已存在: {0}")]
    AlreadyExists(path::PathBuf),
    #[error("资源不存在: {0}")]
    NotFound(path::PathBuf),
    #[error("服务器内部错误: {0}")]
    Internal(#[source] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let span = Span::current();
        span.record("error", tracing::field::display(&self));
        match self {
            AppError::AlreadyExists(path) => (
                StatusCode::CONFLICT,
                Json(json!({
                  "error": format!("目标已存在: {:?}", path),
                })),
            )
                .into_response(),
            AppError::NotFound(path) => (
                StatusCode::NOT_FOUND,
                Json(json!({
                  "error": format!("资源不存在: {:?}",path),
                })),
            )
                .into_response(),
            AppError::BadRequest(msg) => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                  "error": "请求参数无效",
                  "details": msg
                })),
            )
                .into_response(),
            AppError::Internal(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                  "error": "服务器内部错误",
                })),
            )
                .into_response(),
            AppError::ValidationError(err) => {
                let field_errors = extract_validation_errors(&err);
                (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    Json(json!({
                      "error": "参数校验失败",
                      "details": field_errors
                    })),
                )
                    .into_response()
            }
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::Internal(err)
    }
}

fn extract_validation_errors(err: &validator::ValidationErrors) -> Value {
    let mut errors = HashMap::new();

    for (field, errs) in err.field_errors() {
        let message: Vec<String> = errs
            .iter()
            .map(|e| {
                e.message
                    .as_ref()
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| format!("校验失败: {}", e.code))
            })
            .collect();

        errors.insert(field, message);
    }

    json!(errors)
}
