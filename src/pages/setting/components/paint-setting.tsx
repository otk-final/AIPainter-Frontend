import { Button, Input, Select, Slider, InputNumber, Switch } from 'antd';
import React, { useState} from 'react'
import {FormDataProps, formData, PaintFormValueProps, defaultFormValue} from '../data'
import TextArea from 'antd/es/input/TextArea';
import { SlackOutlined, SyncOutlined } from '@ant-design/icons';

interface PaintSettingProps {
    onCallBack: (v: PaintFormValueProps)=>void
}


const PaintSetting:React.FC<PaintSettingProps> = ({onCallBack})=>{
    const [formValue, setFormValue] = useState<PaintFormValueProps>(defaultFormValue)
  
    console.log("formValue", formValue)

    const handleValue = (data: FormDataProps, v:any)=>{
        setFormValue((res)=> {
            let newRes = {...res, [data.key]: v }
            onCallBack(newRes)
            return newRes
        })
    }
  
    const renderItemSlect = (data: FormDataProps) => {
        return (
          <div className='item' key={data.key}>
              <div className='setting-label'>{data.label}</div>
              <div className='item-form flexR'>
                <Select
                  className={`select-auto ${data.key !== 'urlKey' ? "": "w67"}`}
                  defaultValue="lucy"
                  onChange={(v)=>handleValue(data, v)}
                  options={[
                    { value: 'jack', label: 'Jack' },
                    { value: 'lucy', label: 'Lucy' },
                    { value: 'Yiminghe', label: 'yiminghe' },
                    { value: 'disabled', label: 'Disabled', disabled: true },
                  ]}
                />
                {data.key !== 'urlKey' ? null : <div className='btn-s'><SyncOutlined/></div>}
              </div>
          </div>
        )
    }
  
      const renderItemSlider = (data: FormDataProps)=>{
        return (
          <div className='item' key={data.key}>
              <div className='item-header flexR'>
                <div className='setting-label'>{data.label}</div>
                <InputNumber
                  min={data?.option?.min}
                  max={data?.option?.max}
                  value={formValue[data.key]}
                  onChange={(v)=> handleValue(data, v)}
                  className="inputnumber-auto"
                  controls={false}
                />
              </div>
              <Slider
                  className='slider-auto'
                  min={data?.option?.min}
                  max={data?.option?.max}
                  onChange={(v)=> handleValue(data, v)}
                  value={formValue[data.key]}
              />
          </div>
        )
      }
  
    const renderItemInput = (data: FormDataProps)=> {
        return (
          <div className='item' key={data.key}>
              <div className='setting-label'>{data.label}</div>
              <div className='item-form flexR'>
                <InputNumber
                  value={formValue[data.key]}
                  className="main-inputnumber-auto"
                  controls={false}
                  disabled
                />
               <div className='btn-s' onClick={()=>{
                setFormValue((res)=> ({...res, [data.key]: Math.floor(Math.random() * 100) + 1}))
               }}><SlackOutlined/></div>
              </div>
          </div>
        )
    }
  
    const renderItemSwitch = (data: FormDataProps)=> {
        return (
          <div className='item item-no-top flexR' key={data.key}>
              <div>{data.label}</div>
              <Switch  onChange={(v)=>handleValue(data, v)} className="switch-auto" />
          </div>
        )
    }
  
    const renderItem = ()=>{
        return formData.map((i)=>{
            switch(i.type) {
            case "slect" :
                return renderItemSlect(i)
            case "slider" :
                return renderItemSlider(i)
            case "input" :
                return renderItemInput(i)
            case "switch" :
                return renderItemSwitch(i)
            default:
                return null
            }
        })
    }

    return (
        <div>
            <div className='setting-section'>
                <div className='setting-title'>sD WebUI 环境配置</div>
                <div className='setting-form-label flexR half-width'>
                    <div className='flexR'>
                    <div className='setting-label'>SD WebUI URL地址 </div>
                    <span className='setting-label color-primary'>开启方法</span>
                    </div>
                    <div className='setting-label color-open'>已启动</div>
                </div>
                <div className='setting-form flexR half-width'>
                    <Input size="large" placeholder="http://127.0.0.1:7860/"  className='input-s '/>
                    <Button type="primary" className="btn-primary-auto btn-primary-108">检测环境</Button>
                </div>
                </div>
                <div className='setting-section no-padding-h'>
                <div className='setting-title'>批量绘图设置（通用模版）</div>
                <div className='content flexR'>
                    {renderItem()}
                </div>
                <div className='section-bottom flexR'>
                    {formData.slice(formData.length - 2).map((data)=>{
                    return (
                        <div className='item section-bottom' key={data.key}>
                        <div className='setting-label'>{data.label}</div>
                        <TextArea rows={10} placeholder={data?.option?.placeholder} 
                        maxLength={1000} 
                        className="text-area-auto"
                        onChange={(v)=>handleValue(data, v.target.value)}/>
                        </div>
                    )
                    })}
                </div>
            </div>
        </div>

    )
    

}

export default PaintSetting