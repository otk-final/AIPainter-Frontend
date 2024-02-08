import { AudioOption } from "@/repository/tts_api";
import { Cascader, Divider, Select } from "antd";
import React, { Fragment, useEffect, useState } from "react";


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
];


const enOptions: Option[] = []

const langs = [{ label: "中文", value: "zh" }, { label: "英文", value: "en" }]

const TTSVoiceSelect: React.FC<{ onChange: (audioOption: AudioOption) => void }> = ({ onChange }) => {


    const [lang, setLang] = useState("zh")
    const [options, setOptions] = useState<Option[]>([])
    useEffect(() => {
        if (lang === "zh") {
            setOptions([...zhOptions])
        } else {
            setOptions([...enOptions])
        }
    }, [lang])

    const handleChange = (value: string[], selectedOptions: Option[]) => {
        console.log(value, selectedOptions);
        onChange({
            encoding: "mp3",
            voice_type: value[1],
            emotion: value[2],
            language: lang
        })
    };
    const filter = (inputValue: string, path: any[]) => {
        return path.some((option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
    }

    return (<Fragment>
        <Select
            className={`select-auto`}
            style={{ width: '200px' }}
            value={lang}
            onChange={setLang}
            options={langs}
        />
        <Divider type={'vertical'} />
        <Cascader
            className={`select-auto`}
            style={{ width: '300px' }}
            options={options}
            onChange={handleChange}
            placeholder="选择场景/音色/情感"
            showSearch={{ filter }}
        /></Fragment>)
}

export default TTSVoiceSelect

