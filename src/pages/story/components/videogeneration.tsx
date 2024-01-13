import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, InputNumber, Select } from "antd"
import { useState } from "react"
import { fontFamilyDatas, videogFrom, fontSizeDatas, fontColorDatas } from "../data"

const Videogeneration = ()=>{
    const [formData, setFormData] = useState({
        timbre: '1',
        volume: 50,
        pace: 20,
        vfx: '1',
        frame: 30,
        fontSize: 1,
        fontColor: 1,
        fontFamily: 1
    })

    console.log("sssss", formData)

    const handleInputNumberChange = (i, v) => {
        setFormData((res)=>{
            return {...res, [i.key]: v}
        })
    }

    const handleAddon = (i, type: 'add' | 'minus') => {
        setFormData((res)=>{
            let v = (res[i.key] as Number);
            if(type === 'add') {
                if((res[i.key] as Number) < i.max) {
                    v = (res[i.key] as Number) + 1;
                } 
            } else {
                if ((res[i.key] as Number) > i.min) {
                    v = (res[i.key] as Number) - 1;
                }
            }
            return {...res, [i.key]: v}
        })
    }

    const handleSelect = (i, v) => {
        setFormData((res)=>{
            return {...res, [i.key]: v}
        })
    }

    const renderSelect = (i)=>{
        return (
            <div className="form-item flexC" key={i.key}>
                <div className="label">{i.label}</div>
                <Select
                    className={`select-auto`}
                    defaultValue="1"
                    onChange={(v)=> handleSelect(i, v)}
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
            <div className="form-item flexC" key={i.key}>
                <div className="label">{i.label}</div>
                <InputNumber  className={`inputnumber-auto ${i.key === 'frame' ?"" : "has-addon"}`} size="large" 
                    controls={false} 
                    value={formData[i.key]}
                    defaultValue={i.defaultValue}
                    max={i.max}
                    min={i.min}
                    onChange={(v)=> handleInputNumberChange(i, v)}
                    addonBefore={i.key === 'frame' ? "" :<Button type="text" className="addon-btn" onClick={()=>handleAddon(i, 'add')}><PlusOutlined /></Button>}
                    addonAfter={i.key === 'frame'  ? "" : <Button type="text" className="addon-btn" onClick={()=>handleAddon(i, 'minus')}><MinusOutlined /></Button>}
                />
            </div>
        )
    }
    
    return (
        <div className="videogeneration-wrap scrollbar">
            <div className="flexR" style={{justifyContent: "flex-end", marginBottom: '20px'}}>
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
                            {fontSizeDatas.map((i, index)=>{
                                return <div 
                                        className={`fontsize ${formData.fontSize === i.key ? "cur" : ""}`}
                                        key={index} 
                                        style={{fontSize: `${16 + (index * 3)}px`}}
                                        onClick={()=> setFormData((res)=>{
                                            return {...res, fontSize: i.key}
                                        })} 
                                        >{i.label}</div>
                            })}
                        </div>
                    </div>
                </div>
                <div className="form-wrap flexR" style={{marginTop: '30px'}}>
                    <div className="form-item">
                        <div className="label">字体颜色</div>
                        <div className="fontcf-wrap flexR">
                            {fontColorDatas.map((i)=>{
                                return <div className={`fontcf ${formData.fontColor === i.key ? "cur" : ""}`}
                                    key={i.key} style={{background: `#${i.color}`}}
                                    onClick={()=> setFormData((res)=>{
                                        return {...res, fontColor: i.key}
                                    })} 
                                    ></div>
                            })}
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="label">字体</div>
                        <div className="fontcf-wrap flexR">
                            {fontFamilyDatas.map((i)=>{
                                return <img src={i.url} 
                                        className={`fontcf ${formData.fontFamily === i.key ? "cur" : ""}`}
                                        key={i.key}
                                        onClick={()=> setFormData((res)=>{
                                            return {...res, fontFamily: i.key}
                                        })} 
                                        />
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Videogeneration