import React, {useState} from 'react'
import { Button, Carousel, Image, message } from 'antd';
import './index.less'
import assets from '@/assets'
import {CreateProjectModule} from '@/components';
import {history} from "umi"
import { getLoginInfo, useLogin } from '@/uses';
import ImitateProjectModule from '@/components/imitate-project';

const data = [
  {
    key: "create",
    title: "创作视频",
    describe: "三步完成批量绘图&音视频生成",
    btnText: "开始创作"
  },
  {
    key: "imitate",
    title: "一键追爆款",
    describe: "导入爆款视频&快速生成AI同款视频",
    btnText: "开始创作"
  },
  {
    key: "set",
    title: "通用设置",
    describe: "快速设置SD环境、绘画参数等配置",
    btnText: "去设置"
  },
  {
    key: "paint-module",
    title: "绘画模版",
    describe: "基于小说推文特性的SDWebUI模板",
    btnText: "去设置"
  }
]

const myCreationData = [
  {
    title: "阿达舒服的",
    startTime: "2023-12-27",
    status: "批量绘图"
  },
  {
    title: "阿斯顿说",
    startTime: "2023-12-27",
    status: "故事分镜"
  },
  {
    title: "如同一天对方地方",
    startTime: "2023-12-27",
    status: "批量绘图"
  }
]

const carouselData = [
  {
    title: "1",
    url: assets.banner
  },
  {
    title: "2",
    url: assets.banner
  },
  {
    title: "3",
    url: assets.banner
  }
]

const HomePage = () => {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isImitateProjectOpen, setIsImitateProjectOpen] = useState(false);
  const loginInfo = getLoginInfo();
  const {login, logout, loginState} = useLogin();

  const handleBtn = (type: string) => {
    if(!loginState.isLogin){
      return  message.warning("请先登陆～")
    }
    if(type === "create") {
      setIsCreateProjectOpen(true);
    }else if(type === "set") {
      history.push("/setting")
    } else if (type === "imitate"){
      setIsImitateProjectOpen(true);
    }
  }

  const renderMyCreation = ()=>{
    return (
      <div className="section-create-wrap flexR">
        { myCreationData.map((i, index)=>{
            return (
              <div className="home-item-wrap flexR" key={index}>
                <div className="left flexC">
                  <div className="title one-line">{i.title}</div>
                  <div className="describe">开始时间: {i.startTime}</div>
                  <div className="describe">当前环节: {i.status}</div>
                </div>
                <div className="right flexC">
                  <Button type="default" className="btn-default-auto btn-default-100">继续创作</Button>
                  <Button type="default" className="btn-default-auto btn-default-100">删除</Button>
                </div>
              </div>
            )
          }) }
      </div>
     
    )
  }

  const renderMyCreationEmpty = ()=>{
    return (
      <div className="empty-wrap flexC">
        <img src={assets.empty} className="empty-img"/>
        <div className="text">暂无创作</div>
      </div>
    )
  }

  return (
    <div className="home-wrap">
      <Carousel className="carousel-wrap" autoplay>
        {carouselData.map((i, index)=>{
          return (
            <div key={index}>
              <Image  src={i.url} width="100%"  height={300} preview={false}/>
            </div>
          )
        })}
      </Carousel>


        <div className="home-section flexR">
            {data.map((i, index)=>{
              return (
                <div className="home-item-wrap flexR" key={index}>
                  <div className="left flexC">
                    <div className="title">{i.title}</div>
                    <div className="describe one-line">{i.describe}</div>
                  </div>
                  <Button type="default" className="btn-default-auto btn-default-100"onClick={()=> handleBtn(i.key)}>{i.btnText}</Button>
                </div>
              )
            })}
        </div>

        <div className="section-title-wrap">我的创作<span>（生成素材特为您保留30天）</span></div>

        {myCreationData.length ? renderMyCreation() :renderMyCreationEmpty()}

        <CreateProjectModule isOpen={isCreateProjectOpen} onClose={()=> setIsCreateProjectOpen(false)}/>
      <ImitateProjectModule isOpen={isImitateProjectOpen} onClose={() => setIsImitateProjectOpen(false)} />
      
    </div>
  );
}

export default HomePage