import { Button, Image, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { ImtateFrame, usePersistImtateFramesStorage } from "@/stores/frame";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components"
import { Image2TextHandle, Text2ImageHandle, WorkflowScript, registerComfyUIPromptCallback, usePersistComfyUIStorage } from "@/stores/comfyui";
import { v4 as uuid } from "uuid"
import { usePersistUserIdentificationStorage } from "@/stores/auth";

interface GenerateImagesTRProps {
    index: number
    style: string
    frame: ImtateFrame,
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ index, style, frame }) => {
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [stateFrame, setFrame] = useState<ImtateFrame>({ ...frame })
    const { frames, removeFrame, updateFrame, saveOutputFrameFile } = usePersistImtateFramesStorage(state => state)
    useEffect(() => {
        updateFrame(index, stateFrame)
    }, [index, stateFrame])

    const handleGenerateImage = async () => {
        let randIdx = Math.floor(Math.random() * frames.length)
        let randPath = frames[randIdx].path

        let imageHistroy = stateFrame.drawImageHistory ? [...stateFrame.drawImageHistory!] : []
        imageHistroy.push(randPath)

        setFrame({ ...stateFrame, drawImage: randPath, drawImageHistory: imageHistroy })
    }


    //comfyui
    const comfyui = usePersistComfyUIStorage(state => state)
    const { clientId } = usePersistUserIdentificationStorage(state => state)


    //反推关键词
    const handleImage2Text = async () => {

        message.loading("反推关键词...", 0)
        let filename = uuid()
        let comfyuiApi = comfyui.buildApi(clientId)

        //上传文件
        await comfyuiApi.upload(clientId, stateFrame.path, filename)

        //提交任务
        let ws = new WorkflowScript(await comfyui.loadReverseApi())
        let job = await comfyuiApi.prompt(ws, { subfolder: clientId, filename: filename }, Image2TextHandle)

        //关键词所在的节点数
        let step = ws.getWD14TaggerStep()

        const callback = async (promptId: string, respData: any) => {

            //定位结果
            let reversePrompts = respData[promptId]!.outputs![step]!.tags! as string[]
            if (reversePrompts) setFrame({ ...stateFrame, drawPrompt: reversePrompts.join(",") })
            message.destroy()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: stateFrame.path, promptId: job.prompt_id, handle: callback })
    }



    let mockData = {
        "68af50ed-d8f9-4e89-84b2-537cbb8f2568": {
            "prompt": [
                1,
                "68af50ed-d8f9-4e89-84b2-537cbb8f2568",
                {
                    "3": {
                        "inputs": {
                            "seed": 715154751274101,
                            "steps": 20,
                            "cfg": 8,
                            "sampler_name": "euler_ancestral",
                            "scheduler": "normal",
                            "denoise": 1,
                            "model": [
                                "10",
                                0
                            ],
                            "positive": [
                                "6",
                                0
                            ],
                            "negative": [
                                "7",
                                0
                            ],
                            "latent_image": [
                                "10",
                                1
                            ]
                        },
                        "class_type": "KSampler",
                        "_meta": {
                            "title": "KSampler"
                        }
                    },
                    "4": {
                        "inputs": {
                            "ckpt_name": "AnythingV5Ink_ink.safetensors"
                        },
                        "class_type": "CheckpointLoaderSimple",
                        "_meta": {
                            "title": "Load Checkpoint"
                        }
                    },
                    "6": {
                        "inputs": {
                            "text": "1girl, long_hair, looking_at_viewer, black_hair, brown_eyes, jewelry, sitting, closed_mouth, earrings, solo_focus, bracelet, cup, blurry_background, head_rest, chinese_text",
                            "clip": [
                                "4",
                                1
                            ]
                        },
                        "class_type": "CLIPTextEncode",
                        "_meta": {
                            "title": "CLIP Text Encode (Prompt)"
                        }
                    },
                    "7": {
                        "inputs": {
                            "text": "violent",
                            "clip": [
                                "4",
                                1
                            ]
                        },
                        "class_type": "CLIPTextEncode",
                        "_meta": {
                            "title": "CLIP Text Encode (Prompt)"
                        }
                    },
                    "8": {
                        "inputs": {
                            "samples": [
                                "3",
                                0
                            ],
                            "vae": [
                                "16",
                                0
                            ]
                        },
                        "class_type": "VAEDecode",
                        "_meta": {
                            "title": "VAE Decode"
                        }
                    },
                    "9": {
                        "inputs": {
                            "filename_prefix": "ComfyUI",
                            "images": [
                                "8",
                                0
                            ]
                        },
                        "class_type": "SaveImage",
                        "_meta": {
                            "title": "Save Image"
                        }
                    },
                    "10": {
                        "inputs": {
                            "batch_size": 1,
                            "model": [
                                "4",
                                0
                            ],
                            "reference": [
                                "14",
                                0
                            ]
                        },
                        "class_type": "ReferenceOnlySimple",
                        "_meta": {
                            "title": "ReferenceOnlySimple"
                        }
                    },
                    "11": {
                        "inputs": {
                            "image": "output_image6.png",
                            "upload": "image"
                        },
                        "class_type": "LoadImage",
                        "_meta": {
                            "title": "Load Image"
                        }
                    },
                    "13": {
                        "inputs": {
                            "upscale_method": "nearest-exact",
                            "width": 512,
                            "height": 512,
                            "crop": "disabled",
                            "image": [
                                "11",
                                0
                            ]
                        },
                        "class_type": "ImageScale",
                        "_meta": {
                            "title": "Upscale Image"
                        }
                    },
                    "14": {
                        "inputs": {
                            "pixels": [
                                "13",
                                0
                            ],
                            "vae": [
                                "16",
                                0
                            ]
                        },
                        "class_type": "VAEEncode",
                        "_meta": {
                            "title": "VAE Encode"
                        }
                    },
                    "16": {
                        "inputs": {
                            "vae_name": "kl-f8-anime2.ckpt"
                        },
                        "class_type": "VAELoader",
                        "_meta": {
                            "title": "Load VAE"
                        }
                    }
                },
                {},
                [
                    "9"
                ]
            ],
            "outputs": {
                "9": {
                    "images": [
                        {
                            "filename": "ComfyUI_00391_.png",
                            "subfolder": "",
                            "type": "output"
                        },
                        {
                            "filename": "ComfyUI_00392_.png",
                            "subfolder": "",
                            "type": "output"
                        }
                    ]
                }
            },
            "status": {
                "status_str": "success",
                "completed": true,
                "messages": [
                    [
                        "execution_start",
                        {
                            "prompt_id": "68af50ed-d8f9-4e89-84b2-537cbb8f2568"
                        }
                    ],
                    [
                        "execution_cached",
                        {
                            "nodes": [],
                            "prompt_id": "68af50ed-d8f9-4e89-84b2-537cbb8f2568"
                        }
                    ]
                ]
            }
        }
    }

    const handleImage2Image = async () => {
        if (!style) {
            await message.warning("请选择图片风格")
            return
        }
        message.loading("图片生成中...", 0)
        let comfyuiApi = comfyui.buildApi(clientId)

        //根据当前风格选择脚本 提交当前关键词，和默认反向关键词
        let ws = new WorkflowScript(await comfyui.loadModeApi(style))
        let job = await comfyuiApi.prompt(ws, { positive: stateFrame.drawPrompt!, negative: comfyui.negativePrompt! }, Text2ImageHandle)
        let step = ws.getOutputImageStep()


        const callback = async (promptId: string, respData: any) => {
            //回调消息不及时 定时查询
            console.info("status", respData)
            
            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (item) => {

                //下载，保存
                let fileBuffer = await comfyuiApi.download(item.subfolder, item.filename)
                debugger
                let filePath = await saveOutputFrameFile(index, item.filename, fileBuffer)

                //更新状态
                stateFrame.drawImageHistory.push(filePath)
                stateFrame.drawImage = filePath

                setFrame({ ...stateFrame })
            })

            message.destroy()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: stateFrame.path, promptId: job.prompt_id, handle: callback })
    }





    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={() => removeFrame(index)} disabled={frames!.length === 1}>删除</Button>
            </Fragment>
        )
    }


    const renderPrompt = () => {
        return (
            <TextArea rows={7} placeholder={"请输入关键词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.drawPrompt}
                onChange={(e) => { setFrame({ ...stateFrame, drawPrompt: e.target.value }) }} />
        )
    }


    const renderImage = (path?: string) => {
        if (!path) {
            return null
        }
        return <Image src={tauri.convertFileSrc(path)} className="generate-image" preview={false} />
    }


    const renderImageHistory = () => {
        if (!stateFrame?.drawImageHistory?.length) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR"
                style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}
            >
                {stateFrame?.drawImageHistory?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="generate-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2Image}>生成图片</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2Text}>反推关键词</Button>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR'>
            {generateImagesColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'path' ? renderImage(stateFrame.path) : null}
                        {i.key === 'drawPrompt' ? renderPrompt() : null}
                        {i.key === 'drawImage' ? renderImage(stateFrame.drawImage) : null}
                        {i.key === 'drawImageHistory' ? renderImageHistory() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <HistoryImageModule
                isOpen={isOpenHistory} onClose={() => setIsOpenHistory(false)}
                paths={stateFrame?.drawImageHistory || []} defaultPath={stateFrame.drawImage || ""}
                onChangeNewImage={(v) => setFrame(res => {
                    return { ...res, drawImage: v }
                })} />
        </div>
    )
}

export default GenerateImagesTR