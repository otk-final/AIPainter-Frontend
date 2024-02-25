use std::sync::mpsc::Sender;
use futures::executor::block_on;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::api::process::{Command, CommandEvent};

use rayon::ThreadPool;


// 线程池
lazy_static! {
    pub static ref POOL: ThreadPool = rayon::ThreadPoolBuilder::new()
        .num_threads(20)
        .build()
        .unwrap();
}


//关键帧
pub struct ExecuteOutput<T: Clone> {
    pub data: T,
    pub outputs: String,
    pub errors: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HandleProcess<T: Clone> {
    pub except: usize,
    pub completed: usize,
    pub current: T,
}


pub fn execute<T: Clone>(opt_tx: Option<Sender<T>>, name: String, args: Vec<String>, msg: T) -> ExecuteOutput<T> {


    let args_log = args.clone();

    // 创建命令
    let (mut rx, mut child) = Command::new_sidecar("ffmpeg")
        .unwrap()
        .args(args)
        .spawn()
        .expect("Failed to spawn sidecar");

    println!(
        "开始执行关键帧抽取命令[{}]:{} = {:?}",
        child.pid().to_string(),
        name,
        args_log
    );

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
            }
        }

        //退出子进程
        child.kill().unwrap();

        //通知
        match opt_tx {
            None => {}
            Some(tx) => tx.send(msg).unwrap()
        }
    };

    //同步
    block_on(run);

    ExecuteOutput { data: out_msg, outputs: "".to_string(), errors: "".to_string() }
}


