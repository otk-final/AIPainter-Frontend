import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, InputNumber, Select } from "antd"
import { useState } from "react"
import { videogFrom } from "./data"

const Videogeneration = ()=>{
    const [formData, setFormData] = useState({
        timbre: '1',
        volume: 50,
        pace: 20,
        vfx: '1',
        frame: 30
    })

    const handleAddon = (i, type)=>{

    }

    const renderSelect = (i)=>{
        return (
            <div className="form-item flexC">
                <div className="label">{i.label}</div>
                <Select
                    className={`select-auto`}
                    defaultValue="1"
                    onChange={(v)=>{}}
                    options={[
                        { value: '1', label: '视频生成' },
                        { value: '2', label: '视频生成sss' },
                        { value: '3', label: 'sssss' },
                    ]}
                />
            </div>
        )
    }

    const renderInputNumber = (i)=>{
        return (
            <div className="form-item flexC">
                <div className="label">{i.label}</div>
                <InputNumber  className={`inputnumber-auto ${i.key === 'frame' ?"" : "has-addon"}`} size="large" 
                    controls={false} 
                    defaultValue={i.defaultValue}
                    addonBefore={i.key === 'frame' ? "" :<Button type="text" className="addon-btn" onClick={()=>handleAddon(i, 'add')}><PlusOutlined /></Button>}
                    addonAfter={i.key === 'frame'  ? "" : <Button type="text" className="addon-btn" onClick={()=>handleAddon(i, 'minus')}><MinusOutlined /></Button>}
                    
                />
            </div>
        )
    }
    
    return (

        <div className="videogeneration-wrap">
            <div className="flexR" style={{justifyContent: "flex-end", marginBottom: '30px'}}>
                <Button type="default" className="btn-default-auto btn-default-150" >打开视频文件夹</Button>
            </div>
            <div className="section">
                <div className="title">配音设置</div>
                <div className="form-wrap flexR">
                    {
                        videogFrom.map((i)=>{
                            switch(i.type) {
                                case 'select': 
                                    return renderSelect(i)
                                case 'inputNumber':
                                    return renderInputNumber(i)
                                default:
                                    return null;
                            }
                        })
                    }
                </div>
            </div>
            <div className="section">
                <div className="title">字幕设置</div>
                <div className="form-wrap">
                    <div className="form-item">
                        <div className="label">字体大小</div>
                        <div className="flexR">
                            {["小", "中", "大", "特大"].map((i, index)=>{
                                return <div className="fontsize" style={{fontSize: `${16 + (index * 3)}px`}}>{i}</div>
                            })}
                        </div>
                    </div>
                </div>
                <div className="form-wrap flexR" style={{marginTop: '30px'}}>
                    <div className="form-item">
                        <div className="label">字体颜色</div>
                        <div className="fontcf-wrap flexR">
                            {["小", "中", "大", "特大","小", "中", "大", "特大", "大", "特大" ].map((i)=>{
                                return <img src="" className="fontcf"/>
                            })}
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="label">字体</div>
                        <div className="fontcf-wrap flexR">
                            {["小", "中", "大", "特大","小", "中", "大", "特大", "大", "特大"].map((i)=>{
                                return <img src="" className="fontcf"/>
                            })}
                        </div>
                    </div>
                </div>
               
            </div>
        </div>
    )
}

export default Videogeneration