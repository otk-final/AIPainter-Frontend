use std::sync::mpsc::Sender;
use futures::executor::block_on;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::api::process::{Command, CommandEvent};

use rayon::ThreadPool;
use crate::key_export_cmd::KeyFrame;


// 线程池
lazy_static! {

    pub static ref POOL: ThreadPool = rayon::ThreadPoolBuilder::new()
        .num_threads(20)
        // .stack_size(100)
        .build()
        .unwrap();
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExecuteOutput<T: Clone> {
    pub data: T,
    pub outputs: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HandleProcess<T: Clone> {
    pub title: String,
    pub except: usize,
    pub completed: usize,
    pub current: T,
}


pub fn execute<T: Clone>(title: String, cmd: String, args: Vec<String>, msg: T) -> ExecuteOutput<T> {
    let args_log = args.clone();
    // 创建命令
    let (mut rx, mut child) = Command::new_sidecar(cmd)
        .unwrap()
        .args(args)
        .spawn()
        .expect("Failed to spawn sidecar");

    println!("开始执行命令[{}]-{} = {:?}", child.pid().to_string(), title, args_log);

    let out_msg = msg.clone();
    let run = async move {

        // 获取响应
        let mut outputs = vec![];
        let mut errors = vec![];

        //等待命令执行完成
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                outputs.push(line)
            } else if let CommandEvent::Stderr(line) = event {
                errors.push(line)
            } else {
                break;
            }
        }

        //退出子进程
        child.kill().unwrap();

        (outputs, errors)
    };

    //同步
    let (o, e) = block_on(run);
    ExecuteOutput { data: out_msg, outputs: o, errors: e }
}


pub fn async_execute<T: Clone + Send + 'static>(tx: Sender<ExecuteOutput<T>>, title: String, cmd: String, args: Vec<String>, msg: T) {
    let args_log = args.clone();
    // 创建命令
    let (mut rx, mut child) = Command::new_sidecar(cmd)
        .unwrap()
        .args(args)
        .spawn()
        .expect("Failed to spawn sidecar");

    println!("开始执行命令[{}]-{} = {:?}", child.pid().to_string(), title, args_log);

    let run = async move {

        // 获取响应
        let mut outputs = vec![];
        let mut errors = vec![];

        //等待命令执行完成
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                outputs.push(line);
                // child.write("message from Rust\n".as_bytes()).unwrap();
            } else if let CommandEvent::Stderr(line) = event {
                errors.push(line)
            } else {
                break;
            }
        }

        //通知
        tx.send(ExecuteOutput { data: msg, outputs, errors }).unwrap();
    };
    tauri::async_runtime::spawn(run);
}

