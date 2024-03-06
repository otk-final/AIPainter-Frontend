import { AudioOption } from "@/repository/tts_api";
import { Cascader, } from "antd";
import React, { useEffect, useState } from "react";


export interface Option {
    value: string;
    label: string;
    children?: Option[];
    disabled?: boolean;
}


const zhOptions: Option[] = [
    {
        value: '1',
        label: '通用场景',
        children: [
            {
                value: 'BV001_streaming',
                label: '通用女声',
                children: [
                    {
                        value: 'xihu',
                        label: '悲伤',
                    },
                    {
                        value: 'xiasha',
                        label: '讲故事',
                    },
                ],
            },
            {
                value: 'BV002_streaming',
                label: '通用男声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
        ],
    },
    {
        value: '2',
        label: '有声阅读',
        children: [
            {
                value: 'BV115_streaming',
                label: '古风少御',
                children: [
                    {
                        value: 'narrator',
                        label: '旁白',
                    },
                    {
                        value: 'novel_dialog',
                        label: '平和',
                    },
                    {
                        value: 'happy',
                        label: '开心',
                    },
                ],
            }, {
                value: 'BV104_streaming',
                label: '温柔淑女',
                children: [
                    {
                        value: 'narrator',
                        label: '旁白',
                    },
                    {
                        value: 'scare',
                        label: '害怕',
                    },
                    {
                        value: 'happy',
                        label: '开心',
                    },
                ],
            },
        ],
    },
    {
        value: '3',
        label: '视频配音',
        children: [
            {
                value: 'BV408_streaming',
                label: '译制片男声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV426_streaming',
                label: '懒小羊',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV428_streaming',
                label: '清新文艺女声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV403_streaming',
                label: '鸡汤女声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV158_streaming',
                label: '智慧老者',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV157_streaming',
                label: '慈爱姥姥',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BR001_streaming',
                label: '说唱小哥',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV410_streaming',
                label: '活力解说男',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV411_streaming',
                label: '影视解说小帅',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV437_streaming',
                label: '解说小帅',
                children: [
                    {
                        value: '',
                        label: '通用',
                    },
                    {
                        value: 'happy',
                        label: '开心',
                    },
                    {
                        value: 'sed',
                        label: '悲伤',
                    },
                    {
                        value: 'angry',
                        label: '生气',
                    },
                    {
                        value: 'scare',
                        label: '害怕',
                    },
                    {
                        value: 'hate',
                        label: '厌恶',
                    },
                    {
                        value: 'surprise',
                        label: '惊讶',
                    },
                ],
            },
            {
                value: 'BV412_streaming',
                label: '影视解说小美',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV159_streaming',
                label: '纨绔青年',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV418_streaming',
                label: '直播一姐',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV120_streaming',
                label: '反卷青年',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV142_streaming',
                label: '沉稳解说男',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV143_streaming',
                label: '潇洒青年',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV056_streaming',
                label: '阳光男声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV005_streaming',
                label: '活泼女声',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            },
            {
                value: 'BV064_streaming',
                label: '小萝莉',
                children: [
                    {
                        value: '',
                        label: '无',
                    },
                ],
            }
        ]
    }
];


// const langs = [{ label: "中文", value: "zh" }, { label: "英文", value: "en" }]

const TTSVoiceSelect: React.FC<{ option?: AudioOption, onChange: (audioOption: AudioOption) => void }> = ({ option, onChange }) => {
    const [value, setValue] = useState<string[]>([])
    useEffect(() => {
        if (option) setValue([option.voice_classify, option.voice_type, option.emotion])
    }, [option])

    const handleChange = (value: string[]) => {
        onChange({
            voice_classify: value[0],
            voice_type: value[1],
            emotion: value[2],
        })
    };
    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    }

    return <Cascader
        className={`select-auto`}
        // style={{ width: '400px' }}
        options={zhOptions}
        value={value}
        onChange={(value) => { handleChange(value as string[]) }}
        placeholder="选择场景/音色/情感"
        showSearch={{ filter }}
        allowClear={false}
    />
}

export default TTSVoiceSelect

