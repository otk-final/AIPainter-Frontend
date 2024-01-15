import React, { useEffect, useState } from 'react'
import { Button,  Input } from 'antd';
import './index.less'
import { DeleteOutlined, LeftOutlined } from '@ant-design/icons';



const TikTokPage = () => {
    const [url, setUrl] = useState('');

    const handleLoad = () => {}
  
    return (
        <div className="tiktok-wrap scrollbar">
            <div className='page-header flexR'>
            <div className="flexR">
            <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff"  /></div>
            <div className='flexR'>
                视频地址
                <Input size='large' value={url} className='tiktok-input'
                placeholder='请输入视频url'
                 onChange={(v)=>setUrl(v.target.value)}/>
            </div>
            </div>
            <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleLoad}>下载</Button>
        </div>
        <div className='page-header-placeholder'></div>
        <div className='video-wrap flexR' style={{height:"calc(100% - 78px)", overflow: 'scroll'}}>
                {['', '', '', '','', ].map((i, index)=>{
                    return (
                        <div className='video-item' key={index}>
                            <DeleteOutlined className='del flexR'/>
                        </div>
                    )
                })}
        </div>
        </div>
    );
}

export default TikTokPage