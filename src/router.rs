use axum::{
    Router,
    routing::{get, post},
};

use crate::handlers::{
    copy_files, create_dir, delete_files, get_files, health_check, move_files,
    remove_strings_preview, rename_confirm, rename_preview, replace_chinese_preview,
};

pub fn create_app() -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/", get(get_files).post(create_dir).delete(delete_files))
        .route("/copy", post(copy_files))
        .route("/move", post(move_files))
        .route("/preview", post(rename_preview))
        .route("/remove", post(remove_strings_preview))
        .route("/replace", post(replace_chinese_preview))
        .route("/rename", post(rename_confirm))
}
