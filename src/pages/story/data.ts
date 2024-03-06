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
    key: "mixing",
    label: "字幕配音",
    disabled: true
  }
];

export const storyboardColumns = [
  {
    title: "镜号",
    key: "number",
    space: 2,
  },
  {
    title: "原稿",
    key: "draft",
    space: 4,
  },
  {
    title: "场景描述关键词",
    key: "scene",
    space: 4,
  },
  {
    title: "画面角色",
    key: "actors",
    space: 3,
  },

  {
    title: "操作",
    key: "operate",
    space: 2,
  }
  
]

export const drawbatchColumns = [
  {
    title: "镜号",
    key: "number",
    space: 2,
  }, {
    title: "画面描述",
    key: "description",
    space: 4,
  },
  {
    title: "关键词",
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

export const mixingColumns = [
  {
    title: "编号",
    key: "number",
    space: 1,
  },
  {
    title: "原文",
    key: "draft",
    space: 3,
  },
  {
    title: "图片",
    key: "image",
    space: 3,
  },
  {
    title: "字幕",
    key: "srt",
    space: 3,
  },
  {
    title: "配音角色",
    key: "actors",
    space: 3,
  },
  {
    title: "操作",
    key: "operate",
    space: 2,
  }
]