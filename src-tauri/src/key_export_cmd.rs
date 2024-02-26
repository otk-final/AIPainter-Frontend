use std::sync::mpsc::{channel, Sender};
use serde::{Deserialize, Serialize};
use tauri::{Error, Window};
use crate::cmd::{execute, HandleProcess, POOL};

//并发处理关键帧

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFrame {
    pub idx: usize,
    pub name: String,

    //参数
    pub ss: String,
    pub to: String,

    pub image_output: String,
    pub audio_output: String,
    pub video_output: String,

    //字幕
    pub srt: String,
    pub srt_duration: usize,
}


fn handle(tx: Sender<KeyFrame>, video_path: String, audio_path: String, item: KeyFrame) {
    let ss = item.ss.as_str();
    let to = item.to.as_str();

    //生成图片
    let image_args = [
        "-y",
        "-ss", ss,
        "-to", to,
        "-i", video_path.as_str(), "-vframes", "1", "-vf", "select='eq(n,3)'",
        item.image_output.as_str()
    ].iter().map(|item| { item.to_string() }).collect();

    execute(None, String::from("ffmpeg"),format!("关键帧：{}", item.name), image_args, item.clone());

    //生成音频
    let audio_args = [
        "-y",
        "-ss", ss,
        "-to", to,
        "-i", audio_path.as_str(), "-vn", "-ab", "128k", "-f", "mp3",
        item.audio_output.as_str()
    ].iter().map(|item| { item.to_string() }).collect();
    execute(None,  String::from("ffmpeg"),format!("音频：{}", item.name), audio_args, item.clone());

    //生成视频
    let video_args = [
        "-y",
        "-ss", ss,
        "-to", to,
        "-i", video_path.as_str(), "-vcodec", "copy", "-an",
        item.video_output.as_str()
    ].iter().map(|item| { item.to_string() }).collect();
    execute(None,  String::from("ffmpeg"),format!("视频：{}", item.name), video_args, item.clone());

    //通知
    tx.send(item).unwrap()
}

//导出关键帧
#[tauri::command]
pub async fn key_frame_collect(window: Window,
                               video_path: String,
                               audio_path: String,
                               parameters: Vec<KeyFrame>) -> Result<Vec<KeyFrame>, Error> {
    let except_count = parameters.len();
    let (tx, rv) = channel::<KeyFrame>();


    //分发任务
    let _tasks = parameters
        .into_iter()
        .map(move |item| {
            let _tx = tx.clone();
            let _video_path = video_path.clone();
            let _audio_path = audio_path.clone();
            //独立线程
            POOL.spawn(move || { handle(_tx, _video_path, _audio_path, item); })
        })
        .collect::<Vec<_>>();

    //主线程同步监听消息
    let mut out = vec![];
    for msg in rv {
        out.push(msg.clone());

        //通知前端进度
        window.emit("key_frame_collect_process", HandleProcess { except: except_count, completed: out.len(), current: msg.clone() }).expect("send err");

        //所有任务完成退出
        if out.len() == except_count { break; }
    }

    //排序
    out.sort_by(|i, j| {
        i.idx.cmp(&j.idx)
    });


    //执行比对相似度比对





    //通知前端
    Ok(out)
}
