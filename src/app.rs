use std::{sync::Arc, time::Duration};

use axum::{
    Router,
    extract::{DefaultBodyLimit, Request},
    http::{Response, StatusCode},
    routing::{get, post},
};
use tower::limit::ConcurrencyLimitLayer;
use tower_http::{
    catch_panic::CatchPanicLayer,
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::{Span, field::Empty, info_span};

use crate::{
    config::Config,
    file_service::SandBox,
    handlers::{
        copy_items, create_dir, delete_items, get_dirs, get_items, health_check, move_items,
        remove_strings_preview, rename_confirm, rename_item, rename_preview,
        replace_chinese_preview,
    },
};

pub fn create_app(cfg: Config) -> Router {
    let router = Router::new()
        .route(
            "/",
            get(get_items)
                .post(create_dir)
                .delete(delete_items)
                .put(rename_item),
        )
        .route("/tree", get(get_dirs))
        .route("/copy", post(copy_items))
        .route("/move", post(move_items))
        .route("/preview", post(rename_preview))
        .route("/remove", post(remove_strings_preview))
        .route("/replace", post(replace_chinese_preview))
        .route("/rename", post(rename_confirm));

    let sandbox = SandBox::init(cfg.base, cfg.match_exts);
    let state = Arc::new(sandbox);
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .nest("/api", router)
        .route("/health", get(health_check))
        // 状态注入
        .with_state(state)
        // 并发控制，防止过多请求涌入
        .layer(ConcurrencyLimitLayer::new(100))
        // 在响应客户端之前进行压缩，提升传输速度
        .layer(CompressionLayer::new())
        // 请求超时控制
        .layer(TimeoutLayer::with_status_code(
            StatusCode::INTERNAL_SERVER_ERROR,
            Duration::from_secs(cfg.request_timeout),
        ))
        // 捕获panic，防止程序崩溃
        .layer(CatchPanicLayer::new())
        // 日志
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
        // 跨域
        .layer(cors)
        // 限制请求体大小
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024))
}
