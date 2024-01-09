import { Button } from 'antd';
import React, {useEffect, useState} from 'react'
import './index.less'
import {FileImportModule} from '@/components'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { mockStoryboardColumnsData, storyboardColumns } from './data';
import StoryboardTableTR from './components/storyboard-table-tr'
import assets from '@/assets';

interface StoryboardProps {
    onCBScript: ()=> void,
}

const Storyboard:React.FC<StoryboardProps> = ({onCBScript}) => {

    const [isFileOpen, setIsFileOpen] = useState(false);
    const [hasScript, setHasScript] = useState(false);

    const [columnsData, setColumnsData] = useState(mockStoryboardColumnsData)

    const renderEmpty = ()=>{
        return (
            <div className='empty flexC'>
                <img src={assets.empty} className='empty-img'/>
                <div className='empty-text'>故事分镜列表为空， 请导入脚本文件</div>
                <div className='import-btn' onClick={()=> setIsFileOpen(true)}>导入脚本文件</div>
                <div className='sub-text'>请上传故事分镜脚本文件，并完成基于镜头画面的描述词编辑。<span>新手可参考：剧本教学文档</span></div>
            </div>
        )
    }

    const handleStart = (res: boolean)=>{
        if(res) {
            setIsFileOpen(false)
            setHasScript(true);
        }
    }

    const onDelete = (v, index: number)=>{
        setColumnsData((res)=>{
            res.splice(index, 1);
            return res
        })
    }

    const renderTable = ()=>{
        return (
            <div className='script-table-wrap'>
                <div className='th flexR'>
                    {storyboardColumns.map((i)=>{
                        return <div className='th-td' style={{flex: `${i.space}`}}  key={i.key}>{i.title}</div>
                    })}
                </div>
                {
                    columnsData.map((i, index)=>{
                       return ( <StoryboardTableTR key={index} data={{...i, index}} onDelete={(v)=>onDelete(v, index)}/>
                        )
                    })
                }
            </div>
        )
    }
    const renderScriptList = () => {
        return (
            <div>
                <div className='script-header flexR'>
                    <div className='flexR'>
                        <Button type='default' className='btn-default-auto btn-default-150 l-p'>导入脚本文件</Button>
                        <Button type='primary' className='btn-primary-auto btn-primary-108'>推理关键词</Button>
                    </div>
                    <div className='right flexR '>
                        <QuestionCircleOutlined />
                        <div>
                            <div className='text'>剩余能量：7241</div>
                            <div className='text flexR'>已完成分镜: 1/79</div>
                        </div>
                    </div>
                </div>
                {renderTable()}
            </div>
        )
    }

    return (
      <div className="storyboard-wrap">
        {hasScript ? renderScriptList() : renderEmpty()}
        <FileImportModule isOpen={isFileOpen} onClose={()=> {
            setHasScript(true);
            setIsFileOpen(false)
        }} onCB={handleStart}/>
      </div>
    );
  };
  
export default Storyboard
  