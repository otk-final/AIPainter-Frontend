import { CaretDownFilled, CaretUpFilled } from "@ant-design/icons"
import { useState } from "react"

interface RoleTagsImgItemProps {
    data?: any
    hasTags: any[]
    onCB: (item: any)=> void

}

const RoleTagsImgItem:React.FC<RoleTagsImgItemProps> = ({data, hasTags, onCB})=>{
    const [fold, setFold] = useState(false)

    const renderClickItem = (i)=>{
        const checked = hasTags.some(j=> j.key=== i.key);
        return (
            <div key={i.key} 
            className={`role-tag-img-wrap ${checked ? "cur" : ""}`} 
            onClick={()=> onCB(i)}>
                    <img src="" className="tag-img" />
                    <div className="tag-img-text">{i.label}</div>
            </div>
        )
    }

    return (
        <div className="role-tags-wrap">
            <div className="role-tags-title" onClick={()=> setFold(!fold)}>
                {!fold ? <CaretUpFilled className="icon"/> : <CaretDownFilled className="icon"/>} 
                {data.text}
                <span>{data.subText}</span>
            </div>
            {!fold ? ( 
                <div className="role-tags-box flexR">
                    {data.options.map(i=> renderClickItem(i) )}
                </div>
            ) : null}
            
        </div>
    )
}



export default RoleTagsImgItem