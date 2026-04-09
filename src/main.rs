use std::io;

use axum::http::Response;
use tokio::{net::TcpListener, signal};
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;
use tracing::Span;
use tracing_subscriber::{
    EnvFilter,
    fmt::{self},
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

use crate::{middleware::trace_id, router::create_app};

mod error;
mod extractors;
mod file_service;
mod handlers;
mod middleware;
mod models;
mod renamer;
mod router;

#[tokio::main]
async fn main() {
    init_tracing();
    if let Err(e) = run().await {
        tracing::error!("服务启动失败: {}", e)
    }
}

async fn run() -> io::Result<()> {
    let app = create_app().layer(
        ServiceBuilder::new()
            .layer(axum::middleware::from_fn(trace_id))
            .layer(
                TraceLayer::new_for_http()
                    .on_response(|res: &Response<_>, latency, _span: &Span| {
                        let status = res.status();

                        // 根据状态码决定日志等级
                        if status.is_server_error() {
                            tracing::error!(
                              status = %status,
                              latency = ?latency,
                              "failed"
                            )
                        } else if status.is_client_error() {
                            tracing::warn!(
                              status = %status,
                              latency = ?latency,
                              "client error"
                            )
                        } else {
                            tracing::info!(
                              status = %status,
                              latency = ?latency,
                              "completed"
                            );
                        }
                    })
                    .on_failure(|_error, _latency, _span: &Span| {
                        // 什么都不做，避免重复打印 error，错误信息已通过 span 合并到 response 日志中
                    }),
            ),
    );

    let listener = TcpListener::bind("0.0.0.0:7777").await?;

    tracing::info!("HTTP 服务运行中: {}", listener.local_addr()?);
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
}

async fn shutdown_signal() {
    // 监听 ctrl+c
    let ctrl_c = async { signal::ctrl_c().await.expect("无法监听 Ctrl+C 信号") };

    // 监听 SIGTERM (用于 Unix 系统)
    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("无法安装 SIGTERM 信号处理器")
            .recv()
            .await
    };

    // 非 Unix 系统 (例如 Windows)，挂起 terminate future
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    // 使用 select 等待任意一个信号触发
    tokio::select! {
      _ = ctrl_c => {},
      _ = terminate => {}
    }

    tracing::info!("接收到信号，正在关闭 HTTP 服务...")
}

fn init_tracing() {
    let filter_layer =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,tower_http=info".into());

    let fmt_layer = fmt::layer().compact().with_target(true).with_ansi(true);

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(fmt_layer)
        .init();
}
