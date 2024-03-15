use std::borrow::Cow;
use std::path::PathBuf;
use std::sync::Arc;
use reqwest::multipart::Part;
use serde::{Deserialize, Deserializer, Serialize};
use tauri::Error;
use crate::http::{ApiConfig, ApiErr, build_request};


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UploadParameter {
    pub file_path: PathBuf,
    pub file_name: String,
    pub file_part: Option<String>,
    pub payload: serde_json::Map<String, serde_json::Value>,
}

#[tauri::command]
pub async fn http_upload_multipart_handler(client: ApiConfig, parameter: UploadParameter) -> Result<String,ApiErr> {
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
    let payloads = parameter.payload;
    for (name, value) in &payloads {
        let v = value.clone().as_str().unwrap().to_string();
        form = form.text(name.clone(), v);
    }

    //请求参数
    let request = build_request(client);

    //封装响应
    let res = request.multipart(form).send().await.unwrap();
    let res_code = res.status();
    if res_code.is_success(){
        Ok(res.text().await.unwrap())
    }else {
        Err(ApiErr{status: u16::from(res_code), status_text:res.status().canonical_reason().unwrap().to_string()})
    }
}


#[tauri::command]
pub async fn http_upload_handler(mut client: ApiConfig, file_path: String) -> Result<String,ApiErr> {

    //读取本地文件，进行上传
    let file_byte = std::fs::read(file_path).unwrap();
    client.data = Some(file_byte);

    //请求参数
    let request = build_request(client);

    //封装响应
    let res = request.send().await.unwrap();
    let res_code = res.status();
    if res_code.is_success(){
        Ok(res.text().await.unwrap())
    }else {
        Err(ApiErr{status: u16::from(res_code), status_text:res.status().canonical_reason().unwrap().to_string()})
    }
}


// #[tokio::test]
// async fn test() {
//     let config = ApiConfig {
//         method: "POST".to_string(),
//         url: url::Url::options().parse("http://192.168.50.137:8188/upload/image").unwrap(),
//         // headers: vec![("Content-Type".to_string(), "multipart/form-data".to_string())],
//         headers: vec![],
//         data: None,
//         connect_timeout: None,
//         max_redirections: None,
//     };
//
//     let parameter = UploadParameter {
//         file_path: PathBuf::from("/Users/hxy/Desktop/图片/2641692240020_.pic.jpg"),
//         file_part: Some("image".to_string()),
//         file_name: "2641692240020_.pic.jpg".to_string(),
//         payload: vec![("subfolder".to_string(), "hxy".to_string()), ("overwrite".to_string(), "true".to_string())],
//     };
//
//     let run = async {
//         let resp = http_upload_handler(config, parameter).await.unwrap();
//     };
//     block_on(run);
// }