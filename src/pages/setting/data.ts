import { TabsProps } from "antd";

export interface PaintFormValueProps {
  urlKey: string,
  vae: string
  widthV: number,
  stepV: number,
  weightV: number,
  heightV: number,
  seed: number,
  faceRepair: boolean,
  hdRepair: boolean,
  positiveWord: string,
  negativeWord: string,
}

export const defaultFormValue = {
  urlKey: "",
  vae: "",
  widthV: 500,
  stepV: 12,
  weightV: 7,
  heightV: 500,
  seed: -1,
  faceRepair: false,
  hdRepair: false,
  positiveWord: "",
  negativeWord: ""
}


export interface FormDataProps {
  type: 'slect' | 'slider' | "input" | "switch" | 'text-area',
  key: string,
  label: string,
  option?: {
    min?: number,
    max?: number,
    placeholder?: ""
  }
}

export const formData: FormDataProps[] = [
  {
    type: "slect",
    key: "urlKey",
    label: "SD WebUI URL地址",
  },
  {
    type: "slider",
    key: "widthV",
    label: "宽度",
    option: {
      min: 100,
      max: 1000
    }
  },
  {
    type: "slider",
    key: "stepV",
    label: "迭代步敬",
    option: {
      min: 1,
      max: 100
    }
  },
  {
    type: "slider",
    key: "weightV",
    label: "提示词权重",
    option: {
      min: 1,
      max: 50
    }
  },
  {
    type: "slect",
    key: "vae",
    label: "外观 VAE 模型",
  },
  {
    type: "slider",
    key: "heightV",
    label: "高度",
    option: {
      min: 100,
      max: 1000
    }
  },
  {
    type: "slect",
    key: "method",
    label: "采样方法",
  },
  {
    type: "input",
    key: "seed",
    label: "随机数种子 (Seed)",
  },
  {
    type: "switch",
    key: "faceRepair",
    label: "面部修复",
  },
  {
    type: "switch",
    key: "hdRepair",
    label: "高清修复",
  },
  {
    type: "text-area",
    key: "positiveWord",
    label: "正面预设词",
    option: {
      placeholder: "请输入正面预设词",
    }
  },
  {
    type: "text-area",
    key: "negativeWord",
    label: "反面预设词",
    option: {
      placeholder: "请输入正面预设词",
    }
  },
]
