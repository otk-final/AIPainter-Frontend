// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handle;
mod execute;
mod http;

use std::{env, thread};
use std::path::PathBuf;
use std::time::Duration;
use futures::executor::block_on;
use rand::Rng;
use tauri::{Window};
use tauri_plugin_shell::ShellExt;
use crate::handle::export::key_frame_export_handler;
use crate::handle::generate::key_video_generate_handler;
use crate::handle::scale::{key_image_scale_handler, measure_image_handler};
use crate::http::ApiConfig;
use crate::http::download::http_download_handler;
use crate::http::upload::{http_upload_handler, UploadParameter};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
async fn env_current_dir_cmd(window: Window) -> PathBuf {
    env::current_dir().unwrap()
}

#[tauri::command]
async fn env_current_exe_handler(window: Window) -> PathBuf {
    env::current_exe().unwrap()
}

#[tauri::command]
async fn env_delay_handler(window: Window,ms: u64) {
    thread::sleep(Duration::from_millis(ms));
}

#[tauri::command]
fn seed_random_handler(window: Window) -> u64 {
    let mut rng = rand::thread_rng();
    rng.gen_range(10u64.pow(14)..10u64.pow(15) - 1)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            key_frame_export_handler,
            key_video_generate_handler,
            key_image_scale_handler,
            measure_image_handler,
            env_current_dir_cmd,
            env_current_exe_handler,
            env_delay_handler,
            seed_random_handler,
            http_upload_handler,
            http_download_handler,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tokio::main]
async fn main2() {
    let mut u = url::Url::options().parse("http://192.168.50.137:8188/view").unwrap();
    u.query_pairs_mut()
        .append_pair("subfolder", "hxy")
        .append_pair("filename", "image.png")
        .append_pair("type", "input");

    let config = ApiConfig {
        method: "GET".to_string(),
        url: u,
        headers: vec![],
        data: None,
        connect_timeout: None,
        max_redirections: None,
    };

    let run = async {
        let resp = http_download_handler(config, PathBuf::from("/Users/hxy/Desktop/图片/reqs.png")).await.unwrap();
    };
    block_on(run);
}
