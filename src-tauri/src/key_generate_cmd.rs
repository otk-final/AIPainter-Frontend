use std::collections::HashMap;
use std::sync::mpsc::{channel};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::{Error, Window};
use crate::cmd::{execute, HandleProcess, POOL};


//滤镜
lazy_static! {
    static ref EFFECT_DIRECTION:HashMap<&'static str,&'static str> = {
         let mut map = HashMap::new();
         map.insert("up","zoompan='1.5':x='if(lte(on,1),(iw-iw/zoom)/2,x)':y='if(lte(on,-1),(ih-ih/zoom)/2,y+2)'");
         map.insert("down","zoompan='1.5':x='if(lte(on,1),(iw-iw/zoom)/2,x)':y='if(lte(on,1),(ih/zoom)/2,y-2)'");
         map.insert("left","zoompan='1.5':x='if(lte(on,-1),(iw-iw/zoom)/2,x+3)':y='if(lte(on,1),(ih-ih/zoom)/2,y)'");
         map.insert("right","zoompan='1.5':x='if(lte(on,1),(iw/zoom)/2,x-3)':y='if(lte(on,1),(ih-ih/zoom)/2,y)'");
         map
    };
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFragment {
    id: usize,
    effect: KeyFragmentEffect,
    image_path: String,
    audio_path: String,
    video_path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyFragmentEffect {
    pub orientation: String,
}

//并发处理生成视频
#[tauri::command]
pub async fn key_video_generate(window: Window, parameters: Vec<KeyFragment>) -> Result<Vec<KeyFragment>, Error> {
    let except_count = parameters.len();
    let (tx, rv) = channel::<KeyFragment>();

    //分发任务
    let _tasks = parameters
        .into_iter()
        .map(move |item| {
            let _tx = tx.clone();
            let name = item.id.to_string();
            let effect = EFFECT_DIRECTION.get(item.effect.orientation.as_str()).unwrap();

            //参数
            let args = [
                "-y", "-loop", "1", "-i", item.image_path.as_str(), "-i", item.audio_path.as_str(), "-c:v", "libx264", "-tune", "stillimage",
                "-vf", effect,
                // "-r", "5",
                "-shortest",
                item.video_path.as_str()
            ].iter().map(|item| { item.to_string() }).collect();

            let _item = item.clone();
            //独立线程
            POOL.spawn(move || {
                let _ = execute(name, String::from("ffmpeg"), args, item);
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
        i.id.cmp(&j.id)
    });

    //通知前端
    Ok(out)
}
