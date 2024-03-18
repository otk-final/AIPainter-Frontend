import React, { useEffect, useState } from 'react'
import { Button, Carousel, Image, Modal } from 'antd';
import './index.less'
import assets from '@/assets'
import { history } from "umi"
import { ProjectModal } from '@/components/create-project';
import { Project, useProjectRepository } from '@/repository/workspace';
import { DeleteOutlined, RightOutlined } from '@ant-design/icons';
import { LoginModule, UserInfoModule, MemberRechargeModule } from '@/components'
import { useLogin } from '@/uses';


export type ProjectType = "story" | "imitate" | ""
interface homeDataProps {
  key: string,
  title: string,
  describe: string,
  btnText: string,
  pageUrl?: string
}

const data: homeDataProps[] = [
  {
    key: "story",
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
    describe: "快速设置绘画接口、音频生成、翻译等配置",
    btnText: "去设置",
    pageUrl: '/setting'
  },
  {
    key: "draft",
    title: "剪映设置",
    describe: "快速设置剪映草稿、下载等参数",
    btnText: "去设置",
    pageUrl: '/draft'
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
  //加载项目
  const projectRepo = useProjectRepository(state => state)
  

  const [isProjectOpen, setIsProjectOpen] = useState<ProjectType>("");
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isMemberRechargeOpen, setIsMemberRechargeOpen] = useState(false);
  const { logout, loginState } = useLogin();

  
  useEffect(() => {
    projectRepo.load('env')
  }, [])

  const openRecharge = (type: "energy" | 'member') => {
    setIsUserInfoOpen(false);
    if (type === 'energy') {
      // setIsEnergyRechargeOpen(true);
    } else {
      setIsMemberRechargeOpen(true)
    }
  }

  const handleBtn = async (i: homeDataProps) => {
    // if (!loginState.isLogin) {
    //   return message.warning("请先登陆～")
    // }

    if (i?.pageUrl) {
      history.push(i.pageUrl)
    } else if (i.key === "story" || i.key === "imitate") {
      setIsProjectOpen(i.key)
    }
  }

  const handleGoon = (project: Project) => {
    history.push(project.type === "story" ? "/story/" + project.id : "/imitate/" + project.id)
  }

  const handleDel = (idx: number, item: Project) => {
    Modal.confirm({
      title: '确认删除：' + item.name,
      okText: '确认',
      cancelText: '取消',
      footer: (_, { OkBtn, CancelBtn }) => (
        <div className='flexR' style={{ justifyContent: 'center' }}>
          <CancelBtn />
          <OkBtn />
        </div>
      ),
      onOk: async () => {
        await projectRepo.delItem(idx, true)
      }
    });
  }

  const renderMyCreation = () => {
    return (
      <div className="flexR" style={{ flexWrap: 'wrap' }}>
        {projectRepo.items.map((item, index) => {
          return (
            <div className="home-item-wrap" key={index}>
              <img src={assets.avatar} className="create-img" onClick={() => { handleGoon(item!) }} />
              <div className='flexRB'>
                <div className="title one-line">{item?.name}</div>
                <DeleteOutlined style={{ fontSize: '14px' }} onClick={() => handleDel(index, item)} />
              </div>
            </div>
          )
        })}
      </div>

    )
  }

  const renderMyCreationEmpty = () => {
    return (
      <div className="empty-wrap flexC">
        <img src={assets.emptyH} className="empty-img" />
        <div className="text">暂无创作</div>
      </div>
    )
  }

  return (
    <div className="home-wrap scrollbar">
      <div className='flexR'>
        <div className='login-section' onClick={() => !loginState.isLogin && setLoginOpen(true)}>
          <div className='flexR' onClick={() => { !loginState.isLogin ? setIsUserInfoOpen(true) : setLoginOpen(true) }}>
            <img src={loginState.isLogin ? assets.avatar1 : assets.avatar} className="user-img" />
            <div className='text'>{loginState.isLogin ? loginState.nickName : "点击登录账户"}</div>
          </div>
          <div className='vip flexRB' onClick={() => loginState.isLogin && setIsMemberRechargeOpen(true)}>
            {loginState.endTime ? <div><span className='vip-cur'>VIP</span>{loginState.endTime}到期</div> : "开通VIP可无限使用"}
            <RightOutlined />
          </div>
        </div>
        <Carousel className="carousel-wrap" autoplay>
          {carouselData.map((i, index) => {
            return (
              <Image src={i.url} key={index} preview={false} />
            )
          })}
        </Carousel>
      </div>

      <div className='flexR'>
        <div className='ai-item flexR' onClick={() => setIsProjectOpen("story")}>
          <img src={assets.ai1} className="ai-img" />
          <div>
            <div className='title'>AI原创</div>
            <div className='text'>智能分镜、中文提示词帮您快速完成原创</div>
          </div>
        </div>
        <div className='ai-item flexR' onClick={() => setIsProjectOpen("imitate")}>
          <img src={assets.ai2} className="ai-img" />
          <div>
            <div className='title'>AI翻拍</div>
            <div className='text'>三步完成AI视频翻拍</div>
          </div>
        </div>
      </div>
      <div className="home-section flexR">
        {/* {data.map((i, index) => {
          return (
            <div className="home-item-wrap flexR" key={index} >
              <div className="left flexC">
                <div className="title flexR">{i.title}
                  {i.key === 'paint-module' ? <img src={assets.vip} className="vip-img" /> : null}
                </div>
                <div className="describe one-line">{i.describe}</div>
              </div>
              <Button type="default" className="btn-default-auto btn-default-88"
                style={{ margin: 0 }}
                onClick={() => handleBtn(i)}>{i.btnText}</Button>
            </div>
          )
        })} */}
      </div>
      <div className="section-title-wrap flexRB">
        <div>我的草稿<span>（生成素材特为您保留30天）</span></div>
        <div className='jy-set flexR' onClick={() => {history.push("/draft")}}>
          <img src={assets.setIcon} className="set-icon" />
          剪映设置
        </div>
      </div>
      {projectRepo.items.length ? renderMyCreation() : renderMyCreationEmpty()}
      <ProjectModal isOpen={!!isProjectOpen} onClose={() => setIsProjectOpen("")} type={isProjectOpen} />
      <LoginModule isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
      <UserInfoModule isOpen={isUserInfoOpen} onClose={() => setIsUserInfoOpen(false)} openRecharge={openRecharge} />
      <MemberRechargeModule isOpen={isMemberRechargeOpen} onClose={() => setIsMemberRechargeOpen(false)} />
    </div>
  );
}

export default HomePage