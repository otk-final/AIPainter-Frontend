import { useEffect, useState, Fragment } from 'react'
import { Outlet } from 'umi';
import { useLogin } from '@/uses'
import './index.less';
import * as updater from '@tauri-apps/plugin-updater';
import { ClientAuthenticationStore } from '@/api';
import { UpDateVersion } from '@/components';
import DevicePixelRatio from '@/utils/devicePixelRatio'

export default function Layout(props: any) {
  const [update, setUpdate] = useState<updater.Update | undefined>();
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);

  useEffect(() => {
    new DevicePixelRatio().init()
    //初始化
    updater.check().then(e => {
      debugger
      if (e?.available) {
        setUpdateOpen(true)
        setUpdate(e)
      }
    })
    ClientAuthenticationStore.getState().init()
  }, [])


  return (
    <Fragment>
      {/* <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={() => setIsEnergyRechargeOpen(false)} /> */}
      {update && <UpDateVersion isOpen={updateOpen} onClose={() => setUpdateOpen(false)} hold={update} />}
      <Outlet />
    </Fragment>
  );
}
