import { useEffect, useState } from 'react'
import { Carousel, Image, Modal } from 'antd';
import './index.less'
import assets from '@/assets'
import { history } from "umi"
import { Project, useProjectRepository } from '@/repository/workspace';
import { DeleteOutlined, RightOutlined } from '@ant-design/icons';
import { LoginModal, UserInfoModal, JYConfigModal, RechargeModal, ProjectModal } from '@/components'
import { useLogin } from '@/uses';


export type ProjectType = "story" | "imitate"

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


  const [isProjectOpen, setIsProjectOpen] = useState<ProjectType | undefined>();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const [isRechargeOpen, setRechargeOpen] = useState(false);
  const [isJYDraft, setJYDraftOpen] = useState(false)

  const login = useLogin();


  useEffect(() => {
    projectRepo.load('env')
  }, [])

  const openRecharge = (type: "energy" | 'member') => {
    setUserProfileOpen(false);
    setRechargeOpen(true)
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

  const handleReayLogin = () => {
    if (login.isLogin()) {
      setUserProfileOpen(true);
    } else {
      setLoginOpen(true)
    }
  }

  return (
    <div className="home-wrap scrollbar">
      <div className='flexR'>
        <div className='login-section' onClick={() => !login.isLogin() && setLoginOpen(true)}>
          <div className='flexR' onClick={handleReayLogin}>
            <img src={login.isLogin() ? assets.avatar1 : assets.avatar} className="user-img" />
            <div className='text'>{login.isLogin() ? login.user!.name : "点击登录账户"}</div>
          </div>
          <div className='vip flexRB' onClick={() => login.isLogin() && setRechargeOpen(true)}>
            {login.isVip() ? <div><span className='vip-cur'>VIP</span>{login.getVipExpridTime()}到期</div> : "开通VIP可无限使用"}
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
      <div className="section-title-wrap flexRB">
        <div>我的草稿<span>（生成素材特为您保留30天）</span></div>
        <div className='jy-set flexR' onClick={() => setJYDraftOpen(true)}>
          <img src={assets.setIcon} className="set-icon" />
          剪映设置
        </div>
      </div>
      {projectRepo.items.length ? renderMyCreation() : renderMyCreationEmpty()}
      {isProjectOpen && <ProjectModal isOpen={true} onClose={() => setIsProjectOpen(undefined)} type={isProjectOpen} />}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
      {login.isLogin() && <UserInfoModal user={login.user!} vip={login.vip!} isOpen={isUserProfileOpen} onClose={() => setUserProfileOpen(false)} openRecharge={openRecharge} />}
      {login.isLogin() && <RechargeModal user={login.user!} vip={login.vip!}  isOpen={isRechargeOpen} onClose={() => setRechargeOpen(false)} />}
      <JYConfigModal isOpen={isJYDraft} onClose={() => setJYDraftOpen(false)} />
    </div>
  );
}

export default HomePage