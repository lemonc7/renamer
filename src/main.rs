use std::{io, process, time::Duration};

use tokio::{net::TcpListener, signal};
use tracing_subscriber::{
    EnvFilter,
    fmt::{self, time},
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

use crate::{
    app::create_app,
    config::{Config, load_config},
};

mod app;
mod config;
mod error;
mod extractors;
mod file_service;
mod handlers;
mod models;
mod rules;

#[tokio::main]
async fn main() {
    let cfg = load_config("./config/config.toml");
    init_tracing(&cfg.log_level);

    if let Err(e) = run(cfg).await {
        tracing::error!("服务启动失败: {}", e)
    }
}

async fn run(cfg: Config) -> io::Result<()> {
    let listener = TcpListener::bind(format!("0.0.0.0:{}", cfg.port)).await?;
    let app = create_app(cfg);

    tracing::info!("HTTP 服务运行中: {}", listener.local_addr()?);
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
}

async fn shutdown_signal() {
    // 监听 ctrl+c
    let ctrl_c = async { signal::ctrl_c().await.expect("无法监听 Ctrl+C 信号") };

    let terminate = cfg_select! {
        // 监听 SIGTERM (用于 Unix 系统)
        unix => {
            async {
            signal::unix::signal(signal::unix::SignalKind::terminate()).expect("无法安装 SIGTERM 信号处理器").recv().await
            }
        },
        // 非 Unix 系统 (例如 Windows)，挂起 terminate future
        _ => std::future::pending::<()>()
    };

    // 使用 select 等待任意一个信号触发
    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {}
    }

    tracing::info!("接收到信号，正在关闭 HTTP 服务，最多等待 5 秒...");

    // 启动一个独立任务，当连接卡死超时时，强制退出
    tokio::spawn(async {
        tokio::time::sleep(Duration::from_secs(5)).await;
        tracing::error!("优雅关闭超时 (5s)，存在未释放的连接，强制退出程序！");
        process::exit(1);
    });
}

fn init_tracing(level: &str) {
    let filter_layer = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(level));

    let fmt_layer = fmt::layer()
        .compact()
        .with_target(true)
        .with_ansi(true)
        .with_timer(time::ChronoLocal::rfc_3339());

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(fmt_layer)
        .init();
}
