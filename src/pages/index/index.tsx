import React, {useEffect, useState} from 'react'
import { Carousel } from 'antd';
import './index.less'
import assets from '@/assets'
import CreateProjectModule from '@/components/create-project';

const data = [
  {
    key: "create",
    title: "创作视频",
    describe: "三步完成批量绘图&音视频生成",
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

  const handleBtn = (type: string) => {
    console.log("sss")
    if(type === "create") {
      setIsCreateProjectOpen(true);
    }

  }

  const renderMyCreation = ()=>{
    return (
      <div className="section-create-wrap flexR">
        { myCreationData.map((i, index)=>{
            return (
              <div className="home-item-wrap flexR" key={index}>
                <div className="left flexC">
                  <div className="title">{i.title}</div>
                  <div className="describe">开始时间: {i.startTime}</div>
                  <div className="describe">当前环节: {i.status}</div>
                </div>
                <div className="right">
                  <div className="btn">继续创作</div>
                  <div className="btn">删除</div>
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
        <img src="" className="empty-img"/>
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
              <img src={i.url}  />
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
                  <div className="right btn" onClick={()=> handleBtn(i.key)}>{i.btnText}</div>
                </div>
              )
            })}
        </div>

        <div className="section-title-wrap">我的创作<span>（生成素材特为您保留30天）</span></div>

        {!myCreationData.length ? renderMyCreation() :renderMyCreationEmpty()}

        <CreateProjectModule isOpen={isCreateProjectOpen} onClose={()=> setIsCreateProjectOpen(false)}/>
    </div>
  );
}

export default HomePage