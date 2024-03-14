use std::fs::File;
use std::io::{Write};
use std::path::PathBuf;
use crate::http::{ApiConfig, build_request};

#[tauri::command]
pub async fn http_download_handler(client: ApiConfig, file_path: PathBuf) -> tauri_plugin_http::Result<tauri::ipc::Response> {

    let request = build_request(client);
    let res = request.send().await?;

    //后置处理
    let mut resp_bytes;
    if res.status().is_success() {
        //先写入文件
        let mut file = match File::create(&file_path) {
            Err(why) => panic!("couldn't create {}", why),
            Ok(file) => file,
        };

        resp_bytes = res.bytes().await?;
        file.write_all(&resp_bytes)?;
    } else {
        //直接响应输出
        resp_bytes = res.bytes().await?;
    }

    //封装响应
    Ok(tauri::ipc::Response::new(resp_bytes.to_vec()))
}


