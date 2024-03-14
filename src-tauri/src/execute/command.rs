use futures::executor::block_on;
use serde::{Deserialize, Serialize};

use tauri::{Window, Wry};
use tauri_plugin_shell::process::{Command, CommandEvent};
use tauri_plugin_shell::Shell;


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExecuteOutput<T: Clone> {
    pub data: T,
    pub output: String,
    pub error: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HandleProcess<T: Clone> {
    pub title: String,
    pub except: usize,
    pub completed: usize,
    pub current: T,
}


pub fn execute<T: Clone>(cmd: &str, args: Vec<String>, msg: T) -> ExecuteOutput<T> {
    let out_msg = msg.clone();
    let run = async move {
        Command::new_sidecar(cmd).unwrap().args(args).output().await.unwrap()
    };
    //同步
    let output = block_on(run);

    ExecuteOutput {
        data: out_msg,
        output: String::from_utf8(output.stdout).unwrap(),
        error: String::from_utf8(output.stderr).unwrap(),
    }
}