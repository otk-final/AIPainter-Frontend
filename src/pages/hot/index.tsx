import './index.less'
import {Button, Divider, Flex,Typography} from "antd";
import {dialog, fs, os, path, shell} from "@tauri-apps/api";
import {useState} from "react";

const HotPage = () => {
  
  
  const [fileInf, setFileInf] = useState<string>('')
  
  const onChooseMedia = async ()=>{

    
    // select file
    let selected = await dialog.open({
//      multiple:true,
      title:"choose file",
      defaultPath: await path.appLocalDataDir(),
    })
    if (!selected){
      return
    }
    
    
    console.info('selected',selected as [string])
    
    // get frames
    let cmd = shell.Command.sidecar("bin/ffprobe",[
      "-v","error",
      "-count_frames",
      "-select_streams","v:0",
      "-show_chapters",
      "-show_entries","stream=nb_read_frames",
      "-output_format","json",
      selected as string])
    
    let output = await cmd.execute()
    console.info('stdcode',output.code)
    console.info('stdout',JSON.parse(output.stdout))
    console.info('stderr',output.stderr)
    
    
    
//    setFileInf( output.stdout)
    //show file mateinfo
  }
  
  
  
  return <Flex>
    
    <Button onClick={onChooseMedia}>choose media</Button>
    <Divider/>
    <Typography.Text>
      {fileInf}
    </Typography.Text>
  </Flex>
}


export default  HotPage