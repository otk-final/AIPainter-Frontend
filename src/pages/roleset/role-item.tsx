import { Button, Input } from 'antd';
import './index.less'
import { DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';

interface RoleItemProps {
    data: any,
    index: number
}

const RoleItem:React.FC<RoleItemProps> = ({data, index})=>{
    return (
        <div className='role-item'>
            <div className='top flexR'>
                <div className='text'>角色{index}</div>
                <DeleteOutlined />
            </div>
            <div className='content flexR'>
                <div className='content-i  flexC'>
                <div className='RB flexR'>
                    <div className='content-title'>角色姓名</div>
                    <div className='num'>/50</div>
                </div>
                <Input size="large" className='input'/>
                <div className='RB flexR'>
                    <div className='content-title'>角色别名</div>
                    <div className='num'>/50</div>
                </div>
                <Input size="large" className='input'/>
                </div>
                <div className='content-i flexC'>
                <div className='RB flexR'>
                    <div className='content-title'>角色描述</div>
                    <FormOutlined />
                </div>
                <div className='flexC role-tags-wrap'>
                    <PlusOutlined className="add-icon"/>
                    <div>请选择角色行的描述标签</div>
                </div>
                </div>
            </div>
            <div className='content-title' style={{marginTop: '20px', marginBottom: '10px'}}>角色风格</div>
            <Button type='default' block className='btn-default-auto' > 添加LoRA（风格）</Button>
        </div>
    )
}

export default RoleItem