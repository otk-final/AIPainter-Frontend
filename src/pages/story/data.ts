import assets from "@/assets";
import { TabsProps } from "antd";

export const createTabs: TabsProps["items"] = [
  {
    key: "storyboard",
    label: "故事分镜",
  },
  {
    key: "drawbatch",
    label: "批量绘图",
    disabled: true
  },
  {
    key: "videogeneration",
    label: "视频生成",
    disabled: true
  },
];

export const storyboardColumns = [
  {
    title: "镜号",
    key: "number",
    space: 2,
  },
  {
    title: "原文描述",
    key: "original",
    space: 4,
  },
  {
    title: "画面关键词(智能推理)",
    key: "keywords",
    space: 4,
  },
  {
    title: "画面角色",
    key: "actors",
    space: 3,
  },
  {
    title: "画面中的角色描述(中文)",
    key: "prompts",
    space: 4,
  }
]

export const drawbatchColumns = [
  {
    title: "镜号",
    key: "number",
    space: 2,
  }, {
    title: "原文描述",
    key: "original",
    space: 3,
  },
  {
    title: "画面描述词(可输入)",
    key: "drawPrompt",
    space: 4,
  },
  {
    title: "本镜配图",
    key: "drawImage",
    space: 4,
  },
  {
    title: "可选图片",
    key: "drawImageHistory",
    space: 4,
  },
  {
    title: "操作",
    key: "operate",
    space: 2,
  }
]

export const videogFrom = [
  {
    key: 'timbre',
    type: 'select',
    label: '配音音色',
  },
  {
    key: 'volume',
    type: 'inputNumber',
    label: '音量调节',
    defaultValue: '50%',
    max: 100,
    min: 0
  },
  {
    key: 'pace',
    type: 'inputNumber',
    label: '语速调节',
    defaultValue: '20%',
    max: 100,
    min: 0
  },
  {
    key: 'vfx',
    type: 'select',
    label: '特效设置',
  },
  {
    key: 'frame',
    type: 'inputNumber',
    label: '帧数设置',
    defaultValue: '30',
    max: 100,
    min: 1
  },
]

export const mockStoryboardColumnsData = [
  {
    number: 1,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    keyword: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "fasfsdfasafd"
  },
  {
    number: 2,
    describe: "屏幕 ≥ 768px 响应式栅格，可为栅格数或一个包含其他属性的对象",
    keyword: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "",
  },
  {
    number: 3,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    keyword: "asdfasfa原文描述原文sfsfs原文屏幕 ≥ 768px 响应式栅格，可为栅格数或一个包含其他属性的对象描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "fasfsdfasafd"
  },
  {
    number: 4,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    keyword: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "fasfsdfasafd"
  },
  {
    number: 5,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    keyword: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "fasfsdfasafd"
  },
  {
    number: 6,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    keyword: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    roleDescribe: "fasfsdfasafd"
  }
]


export const mockDrawbatchColumnsData = [
  {
    number: 1,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },
  {
    number: 2,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },
  {
    number: 3,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },
  {
    number: 4,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },
  {
    number: 5,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },
  {
    number: 6,
    describe: "原文描述原文原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    describeWord: "asdfasfa原文描述原文sfsfs原文描述原文描述原文描述原文描述原文描述原文描述描述原文描述原文描述原文描述原文描述",
    currentImage: "",
    optionImage: ""
  },

]

export const fontSizeDatas = [
  {
    key: 1,
    label: "小"
  },
  {
    key: 2,
    label: "中"
  },
  {
    key: 3,
    label: "大"
  },
  {
    key: 4,
    label: "特大"
  },
]

export const fontColorDatas = [
  {
    key: 1,
    color: "fff"
  },
  {
    key: 2,
    color: "000"
  },
  {
    key: 3,
    color: "fd3"
  },
  {
    key: 4,
    color: "f38578"
  },
  {
    key: 5,
    color: "eb3a41"
  },
  {
    key: 6,
    color: "bedbf3"
  },
  {
    key: 7,
    color: "5acae1"
  },
  {
    key: 8,
    color: "0034f5"
  },
  {
    key: 9,
    color: "4b4b4f"
  },
  {
    key: 10,
    color: "76e966"
  }
]

export const fontFamilyDatas = [
  {
    key: 1,
    url: assets.fontfamily1
  },
  {
    key: 2,
    url: assets.fontfamily2
  },
  {
    key: 3,
    url: assets.fontfamily3
  },
  {
    key: 4,
    url: assets.fontfamily4
  },
  {
    key: 5,
    url: assets.fontfamily5
  },
  {
    key: 6,
    url: assets.fontfamily6
  },
  {
    key: 7,
    url: assets.fontfamily7
  },
  {
    key: 8,
    url: assets.fontfamily8
  },
  {
    key: 9,
    url: assets.fontfamily9
  },
  {
    key: 10,
    url: assets.fontfamily10
  }
]