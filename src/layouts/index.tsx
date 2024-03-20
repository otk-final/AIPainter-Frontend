import { useEffect, useState, Fragment } from 'react'
import { useLocation, Outlet, history } from 'umi';
import { useLogin } from '@/uses'
import './index.less';
import * as updater from '@tauri-apps/plugin-updater';
import { ClientAuthenticationStore } from '@/api';
import { ComfyUIApi } from '@/api/comfyui_api';
import { v4 as uuid } from 'uuid';
import { useComfyUIRepository } from '@/repository/comfyui';
import {UpDateVersion} from '@/components';


export default function Layout(props: any) {
  const [updateOpen, setUpdateOpen] = useState(false);
  let { pathname } = useLocation();
  console.info("layout", pathname)

  const { logout } = useLogin();

  const comfyuiRepo = useComfyUIRepository(state => state)


  useEffect(() => {
    //初始化
    setUpdateOpen(true);
    ClientAuthenticationStore.getState().init()
  }, [])

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
    console.log("更新")

    // try{
    //   let api = new ComfyUIApi(uuid())
    //     let resp = await api.upload({ subfolder: api.clientId, filename: "abc", type: "input" }, "/Users/hxy/Desktop/图片/2671692240023_.pic.jpg")
    //     console.log("resp", resp)
    // } catch(ex) {
    //   console.log("ex",ex)
    // }
        
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
      {/* <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={() => setIsEnergyRechargeOpen(false)} /> */}
      <UpDateVersion isOpen={updateOpen} onClose={() => setUpdateOpen(false)} onUpdate={withUpdateHandler} />
      <Outlet />
    </Fragment>
  );
}
