import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment } from "react";
import { drawbatchColumns } from "../data";

interface DrawbathTableTRProps {
    data: any,
}

const DrawbathTableTR: React.FC<DrawbathTableTRProps> = ({ data }) => {

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{data.index + 1}</div>
            </Fragment>
        )
    }


    const renderDescribeWord = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面描述词"}
                maxLength={1000} className="text-area-auto"
                onChange={(v) => { }} />

        )
    }

    const renderImage = () => {
        if (!data.url) {
            return <div>待生成</div>
        }
        return (
            <div>
                <Image src="" className="drawbath-image" />
            </div>
        )
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98'>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>调整参数</Button>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR'>
            {drawbatchColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'describeWord' ? renderDescribeWord() : null}
                        {i.key === 'currentImage' || i.key === "optionImage" ? renderImage() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                        {i.key === 'describe' ? data[i.key] : null}
                    </div>
                )
            })}
        </div>
    )
}

export default DrawbathTableTR