use std::cmp::min;
use std::sync::mpsc::{channel, Sender};
use serde::{Deserialize, Serialize};
use tauri::{Error, Manager, State, StateManager, Window, Wry};
use tauri_plugin_os::OsType::Windows;
use tauri_plugin_shell::{Shell, ShellExt};
use tauri_plugin_shell::process::Command;
use crate::execute::command::{execute, HandleProcess};
use crate::execute::pool::POOL;


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFrame {
    pub id: usize,
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

fn export_video(tx: Sender<KeyFrame>, video_path: String, audio_path: String, item: KeyFrame) {
    let ss = item.ss.as_str();
    let to = item.to.as_str();

    //生成视频
    let video_args = [
        "-y",
        "-ss", ss,
        "-to", to,
        "-i", video_path.as_str(), "-vcodec", "copy", "-an",
        item.video_output.as_str()
    ].iter().map(|item| { item.to_string() }).collect();
    let _ = execute( "ffmpeg", video_args, item.clone());

    //通知
    tx.send(item).unwrap()
}


fn export_audio(tx: Sender<KeyFrame>, video_path: String, audio_path: String, item: KeyFrame) {
    let ss = item.ss.as_str();
    let to = item.to.as_str();

    //生成音频
    let audio_args = [
        "-y",
        "-ss", ss,
        "-to", to,
        "-i", audio_path.as_str(), "-vn", "-ab", "128k", "-f", "mp3",
        item.audio_output.as_str()
    ].iter().map(|item| { item.to_string() }).collect();
    let _ = execute("ffmpeg", audio_args, item.clone());

    //通知
    tx.send(item).unwrap()
}


fn export_image(tx: Sender<KeyFrame>, video_path: String, item: KeyFrame) {
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
    let _ = execute("ffmpeg", image_args, item.clone());

    //通知
    tx.send(item).unwrap()
}

fn batch_export_image(window: Window, video_path: String, audio_path: String, parameters: Vec<KeyFrame>) -> Vec<KeyFrame> {
    let except_count = parameters.len();
    let (tx, rv) = channel::<KeyFrame>();

    let _ = parameters.into_iter().for_each(move |item| {
        let _tx = tx.clone();
        let _video_path = video_path.clone();
        let _audio_path = audio_path.clone();
        //独立线程
        POOL.spawn(move || { export_image( _tx, _video_path, item); })
    });

    //主线程同步监听消息 待抽帧完成
    let mut roughs = vec![];
    for msg in rv {
        roughs.push(msg.clone());

        //通知前端进度
        window.emit(&"key_frame_collect_process", HandleProcess { title: "关键帧导出".to_string(), except: except_count, completed: roughs.len(), current: msg.clone() }).expect("send err");

        //所有任务完成退出
        if roughs.len() == except_count { break; }
    }
    //排序
    roughs.sort_by(|i, j| {
        i.id.cmp(&j.id)
    });

    roughs
}

fn batch_export_audio(window: Window, video_path: String, audio_path: String, diffs: Vec<KeyFrame>) -> Vec<KeyFrame> {
    let (tx, rv) = channel::<KeyFrame>();
    let diffs_length = diffs.len();

    let _ = diffs.into_iter().for_each(move |item| {
        let _tx = tx.clone();
        let _video_path = video_path.clone();
        let _audio_path = audio_path.clone();
        //独立线程
        POOL.spawn(move || { export_video(_tx, _video_path, _audio_path, item); })
    });

    //主线程同步监听消息 待抽帧完成
    let mut outputs = vec![];
    for msg in rv {
        outputs.push(msg.clone());
        //通知前端进度
        window.emit("key_frame_collect_process", HandleProcess { title: "音频导出".to_string(), except: diffs_length, completed: outputs.len(), current: msg.clone() }).expect("send err");
        //所有任务完成退出
        if outputs.len() == diffs_length { break; }
    }
    //排序
    outputs.sort_by(|i, j| {
        i.id.cmp(&j.id)
    });
    outputs
}

fn batch_diff_image(window: Window, roughs: Vec<KeyFrame>, threshold: f64, chunk_size: usize, step: usize) -> Vec<KeyFrame> {

    //第一步，分批次并发比对
    let (tx, rv) = channel::<Vec<KeyFrame>>();

    let chunks = roughs.chunks(chunk_size);
    let jobs = chunks.len();
    chunks.for_each(move |batch| {
        let _tx = tx.clone();
        let _batch = batch.to_vec().clone();
        POOL.spawn(move || {
            let batch_outs = diff_images(_batch, threshold, step);
            _tx.send(batch_outs).unwrap();
        })
    });

    //待同步等待完成
    let mut completed = 0;
    let mut diffs = vec![];
    for batch in rv {
        completed = completed + 1;
        diffs.extend(batch);
        window.emit("key_frame_collect_process", HandleProcess { title: "对比".to_string(), except: jobs, completed, current: "" }).expect("send err");
        if completed == jobs { break; }
    }

    //排序
    diffs.sort_by(|i, j| {
        i.id.cmp(&j.id)
    });

    diffs
}

fn diff_images(sources: Vec<KeyFrame>, threshold: f64, step: usize) -> Vec<KeyFrame> {
    let sources_len = sources.len();
    let mut diff_outs: Vec<KeyFrame> = vec![];

    let mut next_idx: usize = 0;
    let mut lasted_merge_id: usize = 0;
    while next_idx < sources_len {
        let mut current = sources.get(next_idx).unwrap().clone();

        //待合并属性
        let mut current_to: String = current.to.clone();
        let mut current_duration = current.srt_duration.clone();
        let mut current_srt: String = current.srt.clone();

        //当前图片 + 目标图片
        let targets = sources[next_idx..min(next_idx + step, sources_len)].iter().map(|item| item.image_output.clone()).collect::<Vec<_>>();
        //只剩一张图，则退出
        if targets.len() <= 1 {
            //当前剩余图片是否已经merge,
            if current.id != lasted_merge_id {
                diff_outs.push(current);
            }
            break;
        }

        //执行命令
        let cmd_outputs = execute("dssim", targets.clone(), "X");
        for value in cmd_outputs.output.split("\n").into_iter() {

            //顺移到下张图片
            next_idx += 1;
            let next_item = sources.get(next_idx).unwrap();

            let next_score_str = value.split("\t").collect::<Vec<_>>()[0];
            let next_score: f64 = next_score_str.parse().unwrap();

            if next_score >= threshold {
                //大于阀值，则退出，下次以该图片为准，继续比对
                break;
            } else {
                //合并时间，和时长
                current_to = next_item.to.clone();
                current_duration = current_duration + &next_item.srt_duration;
                current_srt = format!("{},{}", current_srt, next_item.srt);

                //记录最后合并的id
                lasted_merge_id = next_item.id;
            }
        }

        //重置属性
        current.to = current_to;
        current.srt_duration = current_duration;
        current.srt = current_srt;

        diff_outs.push(current);
    }

    diff_outs
}



//导出关键帧
#[tauri::command]
pub async fn key_frame_export_handler(window: Window,
                                      video_path: String,
                                      audio_path: String,
                                      parameters: Vec<KeyFrame>) -> Result<Vec<KeyFrame>, Error> {

    // method2(window);

    // println!("第一步:抽取关键帧");
    let images = batch_export_image(window, video_path.clone(), audio_path.clone(), parameters);

    // println!("第二步:对比关键帧");
    // let threshold = 0.7;
    //
    // println!("第二步:对比关键帧1");
    // //五张比对
    // let diffs1 = step_diff("第一次图片比对".to_string(), window.clone(), roughs, threshold, 5, 5);
    //
    // //两两比对
    // println!("第三步:对比关键帧2");
    // let diffs2 = step_diff("第二次图片比对".to_string(), window.clone(), diffs1, threshold, 2, 5);
    //
    // println!("第三步:导出音视频");
    // let outputs = step_audio(window.clone(), video_path.clone(), audio_path.clone(), diffs2);

    //通知前端
    Ok(vec![])
}
