// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::executor::block_on;
use futures::task::SpawnExt;
use lazy_static::lazy_static;
use rayon::ThreadPool;
use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::sync::mpsc::{channel, Receiver, Sender};
use tauri::api::process::{Command, CommandEvent};
use tauri::{Error, Manager, Window};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

lazy_static! {

    static ref POOL: ThreadPool = rayon::ThreadPoolBuilder::new()
        .num_threads(20)
        .build()
        .unwrap();

    // static ref KEY_FRAME_COLLECT_CHANNEL:JSChannel<KeyFrameHandleProcess> = {
    //     let (tx,rx) = channel::<KeyFrameHandleProcess>();
    //     JSChannel::<KeyFrameHandleProcess>{sender:Arc::new(Mutex::new(tx)),receiver:Arc::new(Mutex::new(rx))}
    // };
}

pub struct JSChannel<T: Serialize + Clone> {
    pub sender: Arc<Mutex<Sender<T>>>,
    pub receiver: Arc<Mutex<Receiver<T>>>,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFrame {
    idx: usize,
    name: String,

    //参数
    input: String,
    ss: String,
    to: String,
    output: String,

    //字幕
    srt: String,
    srt_start_time: u32,
    srt_end_time: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFrameHandleOutput {
    item: KeyFrame,
    outputs: String,
    errors: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFrameHandleProcess {
    except: usize,
    completed: usize,
    current: KeyFrame,
}


fn key_frame_handle(tx: Sender<KeyFrameHandleOutput>, item: KeyFrame) -> KeyFrameHandleOutput {
    let input: &str = item.input.as_str();
    let ss: &str = item.ss.as_str();
    let to: &str = item.to.as_str();
    let output: &str = item.output.as_str();

    let args = [
        "-y", "-ss", ss, "-i", input, "-to", to, "-f", "image2", "-vframes", "1",
        output
    ];

    // 创建命令
    let (mut rx, mut child) = Command::new_sidecar("ffmpeg")
        .unwrap()
        .args(args)
        .spawn()
        .expect("Failed to spawn sidecar");

    println!(
        "开始执行命令[{}]：,{}",
        child.pid().to_string(),
        item.output
    );


    let _item = item.clone();

    let run = async move {
        // 获取响应
        let mut outputs = vec![];
        let mut errors = vec![];
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                outputs.push(line)
            } else if let CommandEvent::Stderr(line) = event {
                errors.push(line)
            }
        }

        //退出子进程
        child.kill().unwrap();

        // println!("命令执行完成：{}", item.output);
        //通知
        tx.send(KeyFrameHandleOutput {
            item,
            outputs: outputs.join(""),
            errors: errors.join(""),
        }).unwrap();
    };


    //同步
    // tauri::async_runtime::spawn(run);
    block_on(run);

    KeyFrameHandleOutput {
        item: _item,
        outputs: "".to_string(),
        errors: "".to_string(),
    }
}

//并发处理关键帧
#[tauri::command]
async fn key_frame_collect(window: Window, _video_path: String, frames: Vec<KeyFrame>) -> Result<Vec<KeyFrameHandleOutput>, Error> {
    let except_count = frames.len();
    let (tx, rv) = channel::<KeyFrameHandleOutput>();

    //分发任务
    let tasks = frames
        .into_iter()
        .map(|item| {
            let _tx = tx.clone();
            //独立线程
            POOL.spawn(move || { key_frame_handle(_tx, item); })
        })
        .collect::<Vec<_>>();


    //主线程同步监听消息
    let mut out = vec![];
    for msg in rv {
        println!("完成：{}", msg.item.output);
        out.push(msg.clone());

        //通知前端进度
        window.emit("key_frame_collect_process", KeyFrameHandleProcess { except: except_count, completed: out.len(), current: msg.item.clone() }).expect("send err");

        //所有任务完成退出
        if out.len() == except_count { break; }
    }

    //排序
    out.sort_by(|i,j|{
        i.item.idx.cmp(&j.item.idx)
    });

    //通知前端
    Ok(out)
}

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
        .invoke_handler(tauri::generate_handler![key_frame_collect,env_current_dir,env_current_exe])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
