import { BaiduClient } from ".";

export class BaiduApi {

    //翻译文本
    translate = async (text: string) => {
        let resp = await BaiduClient.post("/rpc/2.0/mt/texttrans/v1", {
            q: text,
            from: "auto",
            to: "en"   //统一转换为英文
        });
        if (resp.status !== 200) {
            throw new Error(resp.statusText)
        }
        //状态
        if (resp.data && resp.data.error_code) {
            throw new Error(resp.data.error_msg)
        }
        return resp.data as TranslateResult
    }
}

interface TranslateResult {
    result: {
        trans_result: { dst: string, src: string }[]
    }
    from: string,
    to: string,
    log_id: number
}