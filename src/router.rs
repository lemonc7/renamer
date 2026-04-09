use axum::{
    Router,
    extract::Request,
    http::Response,
    routing::{get, post},
};
use tower_http::trace::TraceLayer;
use tracing::{Span, field::Empty, info_span};

use crate::handlers::{
    copy_files, create_dir, delete_files, get_files, health_check, move_files,
    remove_strings_preview, rename_confirm, rename_preview, replace_chinese_preview,
};

pub fn create_app() -> Router {
    let router = Router::new()
        .route("/", get(get_files).post(create_dir).delete(delete_files))
        .route("/copy", post(copy_files))
        .route("/move", post(move_files))
        .route("/preview", post(rename_preview))
        .route("/remove", post(remove_strings_preview))
        .route("/replace", post(replace_chinese_preview))
        .route("/rename", post(rename_confirm));

    Router::new()
        .nest("/api", router)
        .route("/health", get(health_check))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|req: &Request<_>| {
                    info_span!(
                      "request",
                      method = %req.method(),
                      uri = %req.uri(),
                      error = Empty
                    )
                })
                .on_response(|res: &Response<_>, latency, _span: &Span| {
                    let status = res.status();

                    // 根据状态码决定日志等级
                    if status.is_server_error() {
                        tracing::error!(
                          status = %status,
                          latency = ?latency,
                        )
                    } else if status.is_client_error() {
                        tracing::warn!(
                          status = %status,
                          latency = ?latency,
                        )
                    } else {
                        tracing::info!(
                          status = %status,
                          latency = ?latency,
                        );
                    }
                })
                .on_failure(|_error, _latency, _span: &Span| {
                    // 什么都不做，避免重复打印 error，错误信息已通过 span 合并到 response 日志中
                }),
        )
}
