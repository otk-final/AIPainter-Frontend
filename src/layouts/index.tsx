import { useEffect, useState, Fragment } from 'react'
import { useLocation, Outlet } from 'umi';
import { useLogin } from '@/uses'
import './index.less';
import { Button } from 'antd';
import *  as updater from '@tauri-apps/plugin-updater';
import { RightOutlined } from '@ant-design/icons';
import { ClientAuthenticationStore } from '@/api';
import { ComfyUIApi } from '@/api/comfyui_api';
import { v4 as uuid } from 'uuid';
import { useComfyUIRepository } from '@/repository/comfyui';
import { history } from "umi"
import UpDateVersion from '@/components/update-version';


export default function Layout(props: any) {
  const [updateOpen, setUpdateOpen] = useState(false);
  let { pathname } = useLocation();
  console.info("layout", pathname)

  const { logout, loginState } = useLogin();

  const comfyuiRepo = useComfyUIRepository(state => state)



  useEffect(() => {
    //初始化
    setUpdateOpen(true);
    ClientAuthenticationStore.getState().init()
  }, [])

  const renderPopoverContent = () => {
    return (
      <div className="popver-wrap flexC ">
        {/* <Button type="text" onClick={() => {history.push("/setting")}} >通用设置</Button> */}
        <Button type="text" onClick={() => { history.push("/draft") }} >剪映设置</Button>
        <div className='line'></div>
        <div className='flexRB version'>{`版本号(1.0)`} <div className='version-btn' onClick={() => { }}>点击更新</div></div>
        {loginState.isLogin ? <Button type="text" onClick={logout} >退出登陆 <RightOutlined /></Button> : null}
      </div>
    )
  }

  const [updateProgress, setUpdateProgress] = useState<{ total?: number, complated?: number }>()
  const onUpdateEvent = (progress: updater.DownloadEvent) => {
    if (progress.event === "Started") {
      setUpdateProgress({ total: progress.data.contentLength })
    } else if (progress.event === "Progress") {
      setUpdateProgress({ ...updateProgress, complated: progress.data.chunkLength })
    } else if (progress.event === "Finished") {
      //TODO 
    }
  }

  const withUpdateHandler = async () => {


    let api = new ComfyUIApi(uuid())
    let resp = await api.upload({ subfolder: api.clientId, filename: "abc", type: "input" }, "/Users/hxy/Desktop/图片/2671692240023_.pic.jpg")
    console.info(resp)




    // let content = await readTextFile("sdw.txt", { baseDir: BaseDirectory.Desktop })
    // console.info(content)

    // // let flag = await exists("/sd", { baseDir: BaseDirectory.Desktop })
    // // console.info(flag)
    // let flag = await exists("ss.aa", { baseDir: BaseDirectory.Desktop })
    // console.info(flag);

    // await writeTextFile("sdw.txt", "abcd", { baseDir: BaseDirectory.Desktop, append: true })

    const update = await updater.check();
    console.log("update", update)
    if (update?.available) {
      await update.downloadAndInstall(onUpdateEvent)
    } else {
      console.info('not updated')
    }
  }

  return (
    <Fragment>
      {/* <div className="navs flexR">
        <div className='flexR'>
          <img src={assets.logo} className="logo" />
          <div className='logo-text'>鹦鹉智绘</div>
        </div>
        <div className="right flexR">
          <Popover placement="bottomLeft" content={renderPopoverContent} arrow={false}>
            <img src={assets.setIcon} className="popover-icon" />
          </Popover>
          <img src={assets.foldIcon} className="popover-icon" />
          <img src={assets.unfoldIcon} className="popover-icon" />
          <img src={assets.closeIcon} className="popover-icon" />
        </div>
      </div> */}
      {/* <div className='navs-placeholder'></div> */}
      {/* <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={() => setIsEnergyRechargeOpen(false)} /> */}
      <UpDateVersion isOpen={updateOpen} onClose={() => setUpdateOpen(false)} onUpdate={withUpdateHandler} />
      <Outlet />
    </Fragment>
  );
}
