use std::time::Duration;
use reqwest::{Method, RequestBuilder, StatusCode};
use reqwest::redirect::Policy;
use serde::{Deserialize, Serialize};

pub mod upload;
pub mod download;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ApiConfig {
    pub method: String,
    pub url: url::Url,
    pub headers: serde_json::Map<String, serde_json::Value>,
    pub data: Option<Vec<u8>>,
    pub connect_timeout: Option<u64>,
    pub max_redirections: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ApiErr {
    pub status: u16,
    pub status_text: String,
}

fn build_request(client: ApiConfig) -> RequestBuilder {
    let mut builder = reqwest::ClientBuilder::new();
    let ApiConfig {
        method,
        url,
        headers,
        data,
        connect_timeout,
        max_redirections,
    } = client;

    //基础配置
    if let Some(timeout) = connect_timeout {
        builder = builder.connect_timeout(Duration::from_millis(timeout));
    }
    if let Some(max_redirections) = max_redirections {
        builder = builder.redirect(if max_redirections == 0 {
            Policy::none()
        } else {
            Policy::limited(max_redirections)
        });
    }

    // build request
    let method = Method::from_bytes(method.as_bytes()).unwrap();
    let mut request = builder.build().expect("build err").request(method.clone(), url);

    // let headers: HashMap<String, String> = HashMap::from_iter(headers);
    for (name, value) in &headers {
        request = request.header(name, value.as_str().unwrap_or(""));
    }

    if let Some(data) = data {
        request = request.body(data);
    }

    request
}