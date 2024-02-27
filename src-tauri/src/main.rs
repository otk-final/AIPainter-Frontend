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
use crate::cmd::execute;
use crate::key_export_cmd::{key_frame_collect, KeyFrame};
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


    // let mut outs: Vec<KeyFrame> = (0..282).map(|idx| {
    //     KeyFrame {
    //         idx: 0,
    //         name: "".to_string(),
    //         ss: "".to_string(),
    //         to: "".to_string(),
    //         image_output: format!("/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/7326f325-0a90-4b38-9960-f8a8d76370ca/frames/{}-org.png", idx),
    //         audio_output: "".to_string(),
    //         video_output: "".to_string(),
    //         srt: "".to_string(),
    //         srt_duration: 0,
    //     }
    // }).collect();
    //
    //
    // let threshold = 0.55432121;
    // // let mut outs: Vec<KeyFrame> = vec![];
    // let outs_len = outs.len();
    // let mut diff_outs: Vec<KeyFrame> = vec![];
    //
    // let mut start_idx: usize = 0;
    // //添加第一张
    // diff_outs.push(outs.get(0).unwrap().clone());
    //
    // while start_idx < outs.len() {
    //
    //     let mut current = outs.get(start_idx).unwrap();
    //
    //     //当前图片 + 目标图片
    //     let mut targets = outs[start_idx..min(start_idx + 5, outs_len)].iter().map(|item| item.image_output.clone()).collect::<Vec<_>>();
    //     if (targets.len() < 2) {
    //         break;
    //     }
    //
    //     //执行命令
    //     let cmd_outputs = execute(None, String::from("dssim"), "图片比对".to_string(), targets, "X");
    //
    //     //比对相似度
    //     let mut merge_to: String = current.to.clone();
    //     let mut merge_duration = current.srt_duration.clone();
    //     let mut merge_srt: String = current.srt.clone();
    //
    //     for value in cmd_outputs.outputs.iter() {
    //         //顺移到下张图片
    //         start_idx += 1;
    //
    //         let diff_score_str = value.split("\t").collect::<Vec<_>>()[0];
    //         let diff_score: f64 = diff_score_str.parse().unwrap();
    //         let diff_item = outs.get(start_idx).unwrap();
    //
    //
    //         if diff_score >= threshold {
    //             //记录当前图片
    //             diff_outs.push(diff_item.clone());
    //             break;
    //         } else {
    //             //合并时间，和时长
    //             merge_to = diff_item.to.clone();
    //             merge_duration = merge_duration + &diff_item.srt_duration;
    //             merge_srt = format!("{},{}", merge_srt, diff_item.srt);
    //         }
    //     }
    //
    //
    // }


    //合并时长，和字幕
    // for (idx, item) in diff_outs.iter().enumerate() {
    //     diff_outs.get(idx + 1)
    // }

    // let diff = vec!["/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/7326f325-0a90-4b38-9960-f8a8d76370ca/frames/279-org.png",
    //                 "/Users/hxy/develops/Rust/AIPainter-Frontend/src-tauri/target/debug/7326f325-0a90-4b38-9960-f8a8d76370ca/frames/280-org.png"].iter().map(|item| { item.to_string() }).collect();
    //
    // let out = execute(None, String::from("dssim"), "比对".to_string(), diff, "X");
    // for (idx, value) in out.outputs.iter().enumerate() {
    //     println!("{}-{:?}", idx, value.split("\t").collect::<Vec<_>>()[0])
    // }

    // println!("outputs:{:?}", out.outputs);
    // println!("errors:{:?}", out.errors);
}
