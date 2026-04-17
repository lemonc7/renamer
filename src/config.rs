use std::{fs, path::Path};

use serde::Deserialize;
#[derive(Debug, Deserialize)]
pub struct Config {
    #[serde(default = "default_base")]
    pub base: String,
    #[serde(default = "default_port")]
    pub port: u16,
    #[serde(default = "default_match_exts")]
    pub match_exts: Vec<String>,
    #[serde(default = "default_log_level")]
    pub log_level: String,
    #[serde(default = "default_request_timeout")]
    pub request_timeout: u64,
}

fn default_base() -> String {
    "/home".into()
}
fn default_port() -> u16 {
    8080
}

fn default_match_exts() -> Vec<String> {
    vec![
        "mkv".into(),
        "mp4".into(),
        "avi".into(),
        "flv".into(),
        "m2ts".into(),
        "wmv".into(),
        "rmvb".into(),
        "srt".into(),
        "ass".into(),
        "ssa".into(),
        "sub".into(),
        "smi".into(),
        "jpg".into(),
        "nfo".into(),
    ]
}

fn default_log_level() -> String {
    "info".into()
}
fn default_request_timeout() -> u64 {
    10
}

impl Default for Config {
    fn default() -> Self {
        Self {
            base: default_base(),
            port: default_port(),
            match_exts: default_match_exts(),
            log_level: default_log_level(),
            request_timeout: default_request_timeout(),
        }
    }
}

pub fn load_config<P>(path: P) -> Config
where
    P: AsRef<Path>,
{
    let content = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("无法读取配置文件: {}, 使用默认配置", e);
            return Config::default();
        }
    };

    toml::from_str(&content).unwrap_or_else(|e| {
        eprintln!("解析配置文件失败: {}, 使用默认配置", e);
        Config::default()
    })
}
