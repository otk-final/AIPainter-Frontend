import { TabsProps } from "antd";

export const createTabs: TabsProps["items"] = [
    {
      key: "storyboard",
      label: "故事分镜",
    },
    {
      key: "drawbatch",
      label: "批量绘图",
    },
    {
      key: "videogeneration",
      label: "视频生成",
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
      key: "describe",
      space: 4,
  },
  {
      title: "画面关键词(智能推理)",
      key: "keyword",
      space: 4,
  },
  {
      title: "画面角色",
      key: "role",
      space: 3,
  },
  {
      title: "画面中的角色描述",
      key: "roleDescribe",
      space: 4,
  }
]

export const drawbatchColumns = [
  {
    title: "镜号",
    key: "number",
    space: 2,
  },{
    title: "原文描述",
    key: "describe",
    space: 3,
  },
  {
    title: "画面描述词(可输入)",
    key: "describeWord",
    space: 4,
  },
  {
    title: "本镜配图",
    key: "currentImage",
    space: 3,
  },
  {
    title: "可选图片",
    key: "optionImage",
    space: 3,
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
  },
  {
    key: 'pace',
    type: 'inputNumber',
    label: '语速调节',
    defaultValue: '20%',
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