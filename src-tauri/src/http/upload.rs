use std::borrow::Cow;
use std::collections::HashMap;
use std::path::PathBuf;
use futures::executor::block_on;
use reqwest::multipart::Part;
use serde::{Deserialize, Serialize};
use crate::http::{ApiConfig, build_request};


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UploadParameter {
    pub file_path: PathBuf,
    pub file_name: String,
    pub file_part: Option<String>,
    pub payload: Vec<(String, String)>,
}

#[tauri::command]
pub async fn http_multipart_handler(client: ApiConfig, parameter: UploadParameter) -> tauri_plugin_http::Result<tauri::ipc::Response> {
    let file_path = parameter.file_path;
    let file_name = parameter.file_name;
    let file_part = parameter.file_part.unwrap_or(String::from("file"));

    //读取本地文件，进行上传
    let mut form = reqwest::multipart::Form::new();

    //上传文件
    let file_byte = std::fs::read(file_path).unwrap();
    let part = Part::bytes(Cow::from(file_byte)).file_name(Cow::from(file_name));
    let mut form = form.part(Cow::from(file_part), part);

    //扩展参数
    let payloads: HashMap<String, String> = HashMap::from_iter(parameter.payload);
    for (name, value) in &payloads {
        form = form.text(name.clone(), value.clone());
    }

    //请求参数
    let request = build_request(client);

    //封装响应
    let res = request.multipart(form).send().await?;
    println!("Status: {}", res.text().await.unwrap());
    Ok(tauri::ipc::Response::new(vec![]))
}


#[tauri::command]
pub async fn http_upload_handler(mut client: ApiConfig, file_path: String) -> tauri_plugin_http::Result<tauri::ipc::Response> {

    //读取本地文件，进行上传
    let file_byte = std::fs::read(file_path).unwrap();
    client.data = Some(file_byte);

    //请求参数
    let request = build_request(client);

    //封装响应
    let res = request.send().await?;
    println!("Status: {}", res.text().await.unwrap());
    Ok(tauri::ipc::Response::new(vec![]))
}



#[tokio::test]
async fn test() {
    let config = ApiConfig {
        method: "POST".to_string(),
        url: url::Url::options().parse("http://192.168.50.137:8188/upload/image").unwrap(),
        // headers: vec![("Content-Type".to_string(), "multipart/form-data".to_string())],
        headers: vec![],
        data: None,
        connect_timeout: None,
        max_redirections: None,
    };

    let parameter = UploadParameter {
        file_path: PathBuf::from("/Users/hxy/Desktop/图片/2641692240020_.pic.jpg"),
        file_part: Some("image".to_string()),
        file_name: "2641692240020_.pic.jpg".to_string(),
        payload: vec![("subfolder".to_string(), "hxy".to_string()), ("overwrite".to_string(), "true".to_string())],
    };

    let run = async {
        let resp = http_upload_handler(config, parameter).await.unwrap();
    };
    block_on(run);
}