interface RoleTagsTextItemProps {
    data?: any
    hasTags: any[]
    onCB: (item: any)=> void

}

const RoleTagsTextItem:React.FC<RoleTagsTextItemProps> = ({data, hasTags, onCB})=>{

    const renderClickItem = (i)=>{
        const checked = hasTags.some(j=> j.key=== i.key);
        return <div key={i.key} className={`role-tag-wrap ${checked ? "cur" : ""}`} onClick={()=> onCB(i)}>{i.label}</div>
    }

    return (
        <div className="role-tags-wrap">
            <div className="role-tags-title">{data.text}<span>{data.subText}</span></div>
            <div className="role-tags-box flexR">
                {data.options.map(i=> renderClickItem(i) )}
            </div>
        </div>
    )
}



export default RoleTagsTextItem