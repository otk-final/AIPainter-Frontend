// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handle;
mod execute;
mod http;

use std::{env, thread};
use std::path::PathBuf;
use std::time::Duration;
use rand::Rng;
use tauri::{Manager, Window};
use tauri_plugin_fs::Scope;
use tauri_plugin_shell::ShellExt;
use crate::execute::command::HandleProcess;
use crate::handle::export::key_frame_export_handler;
use crate::handle::generate::key_video_generate_handler;
use crate::handle::scale::{key_image_scale_handler, measure_image_handler};
use crate::http::download::http_download_handler;
use crate::http::upload::{http_upload_handler, http_upload_multipart_handler};

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

#[tokio::main]
async fn main() {
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
            http_upload_multipart_handler,
            http_upload_handler,
            http_download_handler,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
