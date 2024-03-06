// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod key_export_cmd;
mod key_generate_cmd;
mod key_image_scale_cmd;

use std::cmp::{max, min};
use futures::task::SpawnExt;
use serde::{Deserialize, Serialize};
use std::{env, thread};
use std::path::PathBuf;
use std::sync::mpsc::channel;
use std::time::Duration;
use rand::Rng;
use tauri::{Manager};
use crate::cmd::{async_execute, ExecuteOutput};
use crate::key_export_cmd::{key_frames_dssim, key_frame_collect, KeyFrame};
use crate::key_generate_cmd::key_video_generate;
use crate::key_image_scale_cmd::{handle_image_scale, key_image_scale};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
async fn env_current_dir() -> PathBuf {
    env::current_dir().unwrap()
}

#[tauri::command]
async fn env_current_exe() -> PathBuf {
    env::current_exe().unwrap()
}

#[tauri::command]
async fn seed_random() -> u64 {
    let mut rng = rand::thread_rng();
    rng.gen_range(10u64.pow(14)..10u64.pow(15) - 1)
}

#[tauri::command]
async fn env_delay(ms: u64) {
    thread::sleep(Duration::from_millis(ms));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            key_video_generate,
            key_frame_collect,
            key_image_scale,
            seed_random,
            env_delay,
            env_current_dir,
            env_current_exe])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// fn main() {
//     handle_image_scale(,"/Users/hxy/Desktop/图片/2641692240020_.pic.jpg".to_string(),"/Users/hxy/Desktop/图片/2641692240020_up.pic.jpg".to_string())
// }
