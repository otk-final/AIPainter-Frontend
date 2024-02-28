use std::sync::mpsc::{channel};
use serde::{Deserialize, Serialize};
use tauri::{Error, Window};
use crate::cmd::{execute, HandleProcess, POOL};


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyVideo {
    idx: usize,
    image_path: String,
    audio_path: String,
    output: String,
}

//并发处理生成视频
#[tauri::command]
pub async fn key_video_generate(window: Window, parameters: Vec<KeyVideo>) -> Result<Vec<KeyVideo>, Error> {
    let except_count = parameters.len();
    let (tx, rv) = channel::<KeyVideo>();

    //分发任务
    let _tasks = parameters
        .into_iter()
        .map(move |item| {
            let _tx = tx.clone();

            let name = item.idx.to_string();
            //参数
            let args = [
                "-y", "-loop", "1", "-i", item.image_path.as_str(), "-i", item.audio_path.as_str(), "-c:v", "libx264", "-tune", "stillimage",
                "-vf", "format=yuv420p",
                "-r", "5",
                "-shortest",
                item.output.as_str()
            ].iter().map(|item| { item.to_string() }).collect();

            let _item = item.clone();
            //独立线程
            POOL.spawn(move || {
                let _ = execute(name,String::from("ffmpeg"), args, item);
                _tx.send(_item).unwrap();
            })
        })
        .collect::<Vec<_>>();

    //主线程同步监听消息
    let mut out = vec![];
    for msg in rv {
        out.push(msg.clone());

        //通知前端进度
        window.emit("key_audio_generate_process", HandleProcess { title: "生成视频".to_string(), except: except_count, completed: out.len(), current: msg.clone() }).expect("send err");

        //所有任务完成退出
        if out.len() == except_count { break; }
    }

    //排序
    out.sort_by(|i, j| {
        i.idx.cmp(&j.idx)
    });

    //通知前端
    Ok(out)
}
