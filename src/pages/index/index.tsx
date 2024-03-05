import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, Carousel, Image, Modal } from 'antd';
import './index.less'
import assets from '@/assets'
import { history } from "umi"
import { ProjectModal } from '@/components/create-project';
import { Project, useProjectRepository } from '@/repository/workspace';


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
  const [isProjectOpen, setIsProjectOpen] = useState<ProjectType>("");
  const bannerRef = useRef(null);
  let [bannerW, setBannerW] = useState(0);

  useLayoutEffect(() => {
    setBannerW(bannerRef.current.offsetWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', function () {
      if (bannerRef.current) {
        setBannerW(bannerRef.current.offsetWidth);
      }
    })
  }, [])



  const handleBtn = (i: homeDataProps) => {
    // if (!loginState.isLogin) {
    //   return message.warning("请先登陆～")
    // }

    if (i?.pageUrl) {
      history.push(i.pageUrl)
    } else if (i.key === "story" || i.key === "imitate") {
      setIsProjectOpen(i.key)
    }
  }

  //加载项目
  const projectRepo = useProjectRepository(state => state)
  useEffect(() => {
    projectRepo.load('env')
  }, [])



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
      <div className="section-create-wrap flexR">
        {projectRepo.items.map((item, index) => {
          return (
            <div className="home-item-wrap flexR" key={index}>
              <div className="left flexC">
                <div className="title one-line">{item?.name}</div>
                <div className="describe" style={{ marginTop: '-10px' }}>类型: {item?.type}</div>
                <div className="describe">开始时间: {item?.createTime}</div>
                <div className="describe">当前环节: {item?.step}</div>
              </div>
              <div className="right flexC">
                <Button type="default" className="btn-default-auto btn-default-100" onClick={() => { handleGoon(item!) }}>继续创作</Button>
                <Button type="default" className="btn-default-auto btn-default-100" style={{ marginTop: '10px' }} onClick={() => handleDel(index, item)}>删除</Button>
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
      <Carousel className="carousel-wrap" autoplay>
        {carouselData.map((i, index) => {
          return (
            <div key={index} ref={bannerRef}>
              <Image src={i.url} width="100%" height={bannerW / 9 * 1.8} preview={false} />
            </div>
          )
        })}
      </Carousel>


      <div className="home-section flexR">
        {data.map((i, index) => {
          return (
            <div className="home-item-wrap flexR" key={index} >
              <div className="left flexC">
                <div className="title flexR">{i.title}
                  {i.key === 'paint-module' ? <img src={assets.vip} className="vip-img" /> : null}
                </div>
                <div className="describe one-line">{i.describe}</div>
              </div>
              <Button type="default" className="btn-default-auto btn-default-100"
                style={{ margin: 0 }}
                onClick={() => handleBtn(i)}>{i.btnText}</Button>
            </div>
          )
        })}
      </div>

      <div className="section-title-wrap">我的创作<span>（生成素材特为您保留30天）</span></div>

      {projectRepo.items.length ? renderMyCreation() : renderMyCreationEmpty()}
      <ProjectModal isOpen={!!isProjectOpen} onClose={() => setIsProjectOpen("")} type={isProjectOpen} />
    </div>
  );
}

export default HomePage