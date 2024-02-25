// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod key_export_cmd;
mod key_generate_cmd;

use futures::task::SpawnExt;
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use tauri::{Manager};
use crate::key_export_cmd::key_frame_collect;
use crate::key_generate_cmd::key_video_generate;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn env_current_dir() -> PathBuf {
    env::current_dir().unwrap()
}

#[tauri::command]
fn env_current_exe() -> PathBuf {
    env::current_exe().unwrap()
}

fn main() {
    // let k1 = KeyFrame { input: "/Users/hxy/Desktop/test.mp4".to_string(), idx: 0, ss: "00:00:00.080".to_string(), to: "00:00:00.720".to_string(), output: "/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/08b02959-3522-4577-8e08-b716ffe82c13/frames/0.png".to_string(), srt: "".to_string(), srt_start_time: 0, name: "".to_string(), srt_end_time: 0 };
    // let k2 = KeyFrame { input: "/Users/hxy/Desktop/test.mp4".to_string(), idx: 1, ss: "00:00:00.720".to_string(), to: "00:00:01.680".to_string(), output: "/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/08b02959-3522-4577-8e08-b716ffe82c13/frames/1.png".to_string(), srt: "".to_string(), srt_start_time: 0, name: "".to_string(), srt_end_time: 0 };
    // let k3 = KeyFrame { input: "/Users/hxy/Desktop/test.mp4".to_string(), idx: 2, ss: "00:00:00.720".to_string(), to: "00:00:01.680".to_string(), output: "/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/08b02959-3522-4577-8e08-b716ffe82c13/frames/2.png".to_string(), srt: "".to_string(), srt_start_time: 0, name: "".to_string(), srt_end_time: 0 };
    // let k4 = KeyFrame { input: "/Users/hxy/Desktop/test.mp4".to_string(), idx: 3, ss: "00:00:00.720".to_string(), to: "00:00:01.680".to_string(), output: "/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/08b02959-3522-4577-8e08-b716ffe82c13/frames/3.png".to_string(), srt: "".to_string(), srt_start_time: 0, name: "".to_string(), srt_end_time: 0 };
    //
    // let outputs = key_frame_collect("".to_string(), vec![k1, k2, k3, k4]);
    // println!("{:?}", outputs);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            key_video_generate,
            key_frame_collect,
            env_current_dir,
            env_current_exe])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
