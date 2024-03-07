use std::sync::mpsc::channel;
use image::{DynamicImage, GenericImage};
use image::imageops::interpolate_nearest;
use imageproc::drawing::Canvas;
use serde::{Deserialize, Serialize};
use tauri::{Error, Window};
use crate::cmd::{HandleProcess, POOL};


//图片缩放
pub fn handle_image_scale(factor: u32, src_path: String, out_path: String) {
    let img = image::open(src_path).unwrap();
    let (width, height) = img.dimensions();

    let new_width = width * factor;
    let new_height = height * factor;

    // 创建一个新的图像，用于存储放大后的图像
    let mut resized_img = DynamicImage::new_rgb8(new_width, new_height);
    for y in 0..new_height {
        for x in 0..new_width {
            let src_x = (x as f32 / factor as f32).min(width as f32 - 1.0).max(0.0);
            let src_y = (y as f32 / factor as f32).min(height as f32 - 1.0).max(0.0);
            let pixel = interpolate_nearest(&img, src_x, src_y);
            resized_img.put_pixel(x, y, pixel.unwrap());
        }
    }
    resized_img.save(out_path).unwrap();
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ImageDimensions {
    width: u32,
    height: u32,
}

#[tauri::command]
pub async fn measure_image_dimensions(image_path: String) -> ImageDimensions {
    let img = image::open(image_path).unwrap();
    let (width, height) = img.dimensions();
    ImageDimensions { width, height }
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeyImageScale {
    id: usize,
    scale: u32,
    image_path: String,
    output_name: String,
    output_path: String,
}


#[tauri::command]
pub async fn key_image_scale(window: Window, parameters: Vec<KeyImageScale>) -> Result<Vec<KeyImageScale>, Error> {
    let except_count = parameters.len();
    let (tx, rv) = channel::<KeyImageScale>();

    //分发任务
    let _tasks = parameters
        .into_iter()
        .map(move |item| {
            let _tx = tx.clone();
            let _item = item.clone();
            //独立线程
            POOL.spawn(move || {
                let _ = handle_image_scale(_item.scale, _item.image_path, _item.output_path);
                _tx.send(item).unwrap();
            })
        })
        .collect::<Vec<_>>();

    //主线程同步监听消息
    let mut out = vec![];
    for msg in rv {
        out.push(msg.clone());

        //通知前端进度
        window.emit("key_image_scale_process", HandleProcess { title: "高清放大".to_string(), except: except_count, completed: out.len(), current: msg.clone() }).expect("send err");

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
