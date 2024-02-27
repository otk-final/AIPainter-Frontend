// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cmd;
mod key_export_cmd;
mod key_generate_cmd;

use std::cmp::{max, min};
use futures::task::SpawnExt;
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use rand::Rng;
use tauri::{Manager};
use crate::key_export_cmd::{key_frames_dssim, key_frame_collect, KeyFrame};
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

#[tauri::command]
fn seed_random() -> u64 {
    let mut rng = rand::thread_rng();
    rng.gen_range(10u64.pow(14)..10u64.pow(15) - 1)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Dx {
    pub f: String,
}

fn main1() {

    // let arr = vec![Dx{f:"1".to_string()}, Dx{f:"2".to_string()},Dx{f:"3".to_string()}];
    // let arr = (0..10).map(|idx| {
    //     Dx { f: "1".to_string() }
    // }).collect();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            key_video_generate,
            key_frame_collect,
            seed_random,
            env_current_dir,
            env_current_exe])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // let (tx, rv) = channel::<Vec<KeyFrame>>();
    // let outs = [47, 49, 50, 51, 53].map(|idx| {
    //     KeyFrame {
    //         idx,
    //         name: "".to_string(),
    //         ss: format!("00:00:00.{}", idx),
    //         to: "".to_string(),
    //         image_output: format!("/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/7326f325-0a90-4b38-9960-f8a8d76370ca/frames/{}-org.png", idx),
    //         audio_output: "".to_string(),
    //         video_output: "".to_string(),
    //         srt: "".to_string(),
    //         srt_duration: 0,
    //     }
    // }).into_iter().collect::<Vec<_>>();
    //
    // let threshold = 0.55432121;
    // let step = 5;
    // //
    // key_frames_dssim(outs, threshold, step);
}
