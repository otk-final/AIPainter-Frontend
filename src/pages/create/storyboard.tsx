import { Button, Input, Select, Slider, Tabs, InputNumber, Switch } from 'antd';
import React, {useEffect, useState, Fragment} from 'react'
import './index.less'
import FileImportModule from '@/components/file-import';


const Storyboard:React.FC = () => {
    const [isFileOpen, setIsFileOpen] = useState(false);
    const [hasScript, setHasScript] = useState(false);


    const renderEmpty = ()=>{
        return (
            <div className='empty flexC'>
                <img src='' className='empty-img'/>
                <div className='empty-text'>故事分镜列表为空， 请导入脚本文件</div>
                <div className='import-btn' onClick={()=> setIsFileOpen(true)}>导入脚本文件</div>
                <div className='sub-text'>请上传故事分镜脚本文件，并完成基于镜头画面的描述词编辑。<span>新手可参考：剧本教学文档</span></div>
            </div>
        )
    }

    const renderScriptList = () => {
        return (
            <div>
                <div className='script-header flexR'>

                </div>
            </div>

        )

    }

    return (
      <div className="storyboard-wrap">
        {hasScript ? renderScriptList() : renderEmpty()}

        
        <FileImportModule isOpen={isFileOpen} onClose={()=> setIsFileOpen(false)}/>
      </div>
    );
  };
  
export default Storyboard
  