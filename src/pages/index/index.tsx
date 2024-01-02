import React, {useEffect, useState, Fragment} from 'react'
import { Link, IRouteComponentProps, useLocation } from 'umi';
import './index.less'

const data = [
  {
    title: "创作视频",
    describe: "三步完成批量绘图&音视频生成",
    btnText: "开始创作"
  },
  {
    title: "通用设置",
    describe: "快速设置SD环境、绘画参数等配置",
    btnText: "去设置"
  },
  {
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

const HomePage = () => {
  useEffect(()=>{
    console.log("shouye")
  },[]) 

  return (
    <div className="home-wrap">
        <div className="home-section flexR">
            {data.map((item, index)=>{
              return (
                <div className="home-item-wrap flexR" key={index}>
                  <div className="left flexC">
                    <div className="title">{item.title}</div>
                    <div className="describe">{item.describe}</div>
                  </div>
                  <div className="right btn">{item.btnText}</div>
                </div>
              )
            })}
        </div>

        <div className="section-title-wrap">我的创作<span>（生成素材特为您保留30天）</span></div>

        <div className="section-create-wrap flexR">
          {myCreationData.map((item, index)=>{
              return (
                <div className="home-item-wrap flexR" key={index}>
                  <div className="left flexC">
                    <div className="title">{item.title}</div>
                    <div className="describe">开始时间: {item.startTime}</div>
                    <div className="describe">当前环节: {item.status}</div>
                  </div>
                  <div className="right">
                    <div className="btn">继续创作</div>
                    <div className="btn">删除</div>
                  </div>
                </div>
              )
            })}
        </div>
      

      
    </div>
  );
}

export default HomePage