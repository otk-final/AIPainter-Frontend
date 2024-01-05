import { TabsProps } from "antd";

export const createTabs: TabsProps['items'] = [
    {
      key: 'storyboard',
      label: '故事分镜',
    },
    {
      key: 'batchdraw',
      label: '批量绘图',
    },
    {
      key: 'videogeneration',
      label: '视频生成',
    },
];
  