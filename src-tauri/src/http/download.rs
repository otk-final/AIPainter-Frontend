use std::fs::{create_dir_all, File};
use std::io::{Write};
use std::path::PathBuf;
use tauri::Error;
use crate::http::{ApiConfig, ApiErr, build_request};

#[tauri::command]
pub async fn http_download_handler(client: ApiConfig, file_path: PathBuf) -> Result<String,ApiErr> {

    let request = build_request(client);
    let res = request.send().await.unwrap();

    //创建上级目录
    create_dir_all(file_path.parent().unwrap()).unwrap();

    //后置处理
    if res.status().is_success() {
        let mut file = File::create(&file_path).unwrap();

        let resp_bytes = res.bytes().await.unwrap();
        file.write_all(&resp_bytes).unwrap();
        file.flush().unwrap();

        Ok("OK".to_string())
    } else {
        Err(ApiErr{status: u16::from(res.status()),status_text:res.text().await.unwrap()})
    }
}


