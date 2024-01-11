import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment } from "react";
import { generateImagesColumns } from "../data";

interface GenerateImagesTRProps {
    data: any,
}

const GenerateImagesTR:React.FC<GenerateImagesTRProps> = ({data}) => {

    const renderNumber = ()=>{
        return (
            <Fragment>
                <div className='index'>{data.index + 1}</div>
            </Fragment>
        )
    }


    const renderDescribeWord = ()=>{
        return (
            <TextArea rows={7} placeholder={"请输入关键词"} 
                maxLength={1000} className="text-area-auto"
                onChange={(v)=>{}}/>
        )
    }

    const renderImage = ()=>{
        if(!data.url) {
            return null
        }
        return <Image src="" className="generate-image"/>
    }

    const renderOperate = ()=>{
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98'>生成</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>高清放大</Button>
            </Fragment>
        )
    }

    const renderHistoryImages = ()=>{
        return (
            <div className="flexR" style={{flexWrap: "wrap", justifyContent: "flex-start", width: '100%'}}>
                {['', ''].map(()=>{
                    return <Image src="" className="generate-image size-s"/>
                })}
            </div>
        )
    }


    return (
        <div className='tr flexR'>
            {generateImagesColumns.map((i, index)=>{
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{flex: `${i.space}`}}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'originalImage' || i.key ===  "newImage" ? renderImage() : null}
                        {i.key === 'keyword'  ? renderDescribeWord() : null}
                        {i.key === 'historyImages'  ? renderHistoryImages() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
        </div>
    )
}

export default GenerateImagesTR