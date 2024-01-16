

export interface TraitsConfig {
	key: string
	name: string
	requirement?: string
	options: TraitsOption[]
}

export interface TraitsOption {
	key: string
	label: string
	value?: string
	image?: string
}



export const traitsConfigs: TraitsConfig[] = [
	{
		"key": "person-age",
		"name": "角色",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "person-age@1",
				"label": "女青年",
				"value": "(1girl:1.1)",
				"image": ""
			},
			{
				"key": "person-age@2",
				"label": "男青年",
				"value": "(1boy:1.1)",
				"image": ""
			},
			{
				"key": "person-age@3",
				"label": "少女",
				"value": "(1teenager:1.1),( 13years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@4",
				"label": "少年",
				"value": "(1teenager:1.1)\\(1boy\\),( 13years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@5",
				"label": "幼女",
				"value": "(1toddler:1.1),( 1year old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@6",
				"label": "幼童",
				"value": "(1toddler:1.1)\\(1boy\\),( 1year old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@7",
				"label": "成熟女性",
				"value": "(1mature female:1.1),( 30years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@8",
				"label": "成熟男性",
				"value": "(1mature male:1.1),(30years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@9",
				"label": "老奶奶",
				"value": "(1elderly:1.1),( 80years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@10",
				"label": "老爷爷",
				"value": "(1elderly:1.1)\\(1male\\),( 80years old:1.1)",
				"image": ""
			},
			{
				"key": "person-age@11",
				"label": "婴儿",
				"value": "(1baby:1.1)\\(cute,bald\\),(1year old:1.1)",
				"image": ""
			}
		]
	},
	{
		"key": "person-stature",
		"name": "体型",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "person-stature@1",
				"label": "偏瘦",
				"value": "slim body",
				"image": ""
			},
			{
				"key": "person-stature@2",
				"label": "健壮",
				"value": "muscular",
				"image": ""
			},
			{
				"key": "person-stature@3",
				"label": "肥胖",
				"value": "fat body, stomach",
				"image": ""
			},
			{
				"key": "person-stature@4",
				"label": "孕妇",
				"value": "pregnant",
				"image": ""
			}
		]
	},
	{
		"key": "person-skin",
		"name": "肤色",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "person-skin@1",
				"label": "苍白",
				"value": "pale skin",
				"image": ""
			},
			{
				"key": "person-skin@2",
				"label": "白嫩",
				"value": "white skin",
				"image": ""
			},
			{
				"key": "person-skin@3",
				"label": "古铜",
				"value": "tan skin",
				"image": ""
			},
			{
				"key": "person-skin@4",
				"label": "南非",
				"value": "black skin",
				"image": ""
			}
		]
	},
	{
		"key": "hair-color",
		"name": "发色",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "hair-color@1",
				"label": "黑色",
				"value": "black hair",
				"image": ""
			},
			{
				"key": "hair-color@2",
				"label": "棕色",
				"value": "brown hair",
				"image": ""
			},
			{
				"key": "hair-color@3",
				"label": "秘鲁色",
				"value": "peru hair",
				"image": ""
			},
			{
				"key": "hair-color@4",
				"label": "橄榄色",
				"value": "olive hair",
				"image": ""
			},
			{
				"key": "hair-color@5",
				"label": "褐色",
				"value": "tan hair",
				"image": ""
			},
			{
				"key": "hair-color@6",
				"label": "淡橄榄色",
				"value": "olivedrab",
				"image": ""
			},
			{
				"key": "hair-color@7",
				"label": "黄色",
				"value": "yellow hair",
				"image": ""
			},
			{
				"key": "hair-color@8",
				"label": "姜黄色",
				"value": "turmeric hair",
				"image": ""
			},
			{
				"key": "hair-color@9",
				"label": "金色",
				"value": "blonde hair",
				"image": ""
			},
			{
				"key": "hair-color@10",
				"label": "浅黄色",
				"value": "lightyellow hair",
				"image": ""
			},
			{
				"key": "hair-color@11",
				"label": "橙色",
				"value": "orange hair",
				"image": ""
			},
			{
				"key": "hair-color@12",
				"label": "耐火砖色",
				"value": "firebrick hair",
				"image": ""
			},
			{
				"key": "hair-color@13",
				"label": "珊瑚色",
				"value": "coral hair",
				"image": ""
			},
			{
				"key": "hair-color@14",
				"label": "鲑鱼色",
				"value": "salmon hair",
				"image": ""
			},
			{
				"key": "hair-color@15",
				"label": "红色",
				"value": "red hair",
				"image": ""
			},
			{
				"key": "hair-color@16",
				"label": "栗色",
				"value": "maroon hair",
				"image": ""
			},
			{
				"key": "hair-color@17",
				"label": "李子色",
				"value": "plum hair",
				"image": ""
			},
			{
				"key": "hair-color@18",
				"label": "洋红色",
				"value": "magenta hair",
				"image": ""
			},
			{
				"key": "hair-color@19",
				"label": "粉色",
				"value": "pink hair",
				"image": ""
			},
			{
				"key": "hair-color@20",
				"label": "紫红色",
				"value": "fuchsia hair",
				"image": ""
			},
			{
				"key": "hair-color@21",
				"label": "深粉色",
				"value": "deeppink hair",
				"image": ""
			},
			{
				"key": "hair-color@22",
				"label": "浅粉色",
				"value": "lightpink hair",
				"image": ""
			},
			{
				"key": "hair-color@23",
				"label": "紫色",
				"value": "purple hair",
				"image": ""
			},
			{
				"key": "hair-color@24",
				"label": "靛蓝色",
				"value": "indigo hair",
				"image": ""
			},
			{
				"key": "hair-color@25",
				"label": "兰花色",
				"value": "orchid hair",
				"image": ""
			},
			{
				"key": "hair-color@26",
				"label": "淡紫色",
				"value": "lavender hair",
				"image": ""
			},
			{
				"key": "hair-color@27",
				"label": "蓝色",
				"value": "blue hair",
				"image": ""
			},
			{
				"key": "hair-color@28",
				"label": "皇家蓝",
				"value": "royalblue hair",
				"image": ""
			},
			{
				"key": "hair-color@29",
				"label": "蔚蓝色",
				"value": "azure hair",
				"image": ""
			},
			{
				"key": "hair-color@30",
				"label": "天空蓝",
				"value": "skyblue hair",
				"image": ""
			},
			{
				"key": "hair-color@31",
				"label": "蓝绿色",
				"value": "teal hair",
				"image": ""
			},
			{
				"key": "hair-color@32",
				"label": "青色",
				"value": "aqua hair",
				"image": ""
			},
			{
				"key": "hair-color@33",
				"label": "绿色",
				"value": "green hair",
				"image": ""
			},
			{
				"key": "hair-color@34",
				"label": "深绿色",
				"value": "darkgreen hair",
				"image": ""
			},
			{
				"key": "hair-color@35",
				"label": "碧绿色",
				"value": "seagreen hair",
				"image": ""
			},
			{
				"key": "hair-color@36",
				"label": "橄榄绿",
				"value": "olivegreen hair",
				"image": ""
			},
			{
				"key": "hair-color@37",
				"label": "黄绿色",
				"value": "yellowgreen hair",
				"image": ""
			},
			{
				"key": "hair-color@38",
				"label": "白色",
				"value": "white hair",
				"image": ""
			},
			{
				"key": "hair-color@39",
				"label": "雪白色",
				"value": "snow hair",
				"image": ""
			},
			{
				"key": "hair-color@40",
				"label": "银色",
				"value": "silver hair",
				"image": ""
			},
			{
				"key": "hair-color@41",
				"label": "灰色",
				"value": "grey hait",
				"image": ""
			}
		]
	},
	{
		"key": "hair-style",
		"name": "发型",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "hair-style@1",
				"label": "短发",
				"value": "short hair",
				"image": ""
			},
			{
				"key": "hair-style@2",
				"label": "长发",
				"value": "long hair",
				"image": ""
			},
			{
				"key": "hair-style@3",
				"label": "卷发",
				"value": "curly hair",
				"image": ""
			},
			{
				"key": "hair-style@4",
				"label": "秃头",
				"value": "bald",
				"image": ""
			},
			{
				"key": "hair-style@5",
				"label": "刺猬头",
				"value": "spiked hair",
				"image": ""
			},
			{
				"key": "hair-style@6",
				"label": "朋克头",
				"value": "mohawk hair",
				"image": ""
			},
			{
				"key": "hair-style@7",
				"label": "脏辫",
				"value": "dreadlocks",
				"image": ""
			},
			{
				"key": "hair-style@8",
				"label": "男士发型",
				"value": "",
				"image": ""
			},
			{
				"key": "hair-style@9",
				"label": "美式圆寸",
				"value": "buzz cut",
				"image": ""
			},
			{
				"key": "hair-style@10",
				"label": "飞机头",
				"value": "pompadour",
				"image": ""
			},
			{
				"key": "hair-style@11",
				"label": "女士发型",
				"value": "",
				"image": ""
			},
			{
				"key": "hair-style@12",
				"label": "直发",
				"value": "straight hair",
				"image": ""
			},
			{
				"key": "hair-style@13",
				"label": "波浪头",
				"value": "wavy hair",
				"image": ""
			},
			{
				"key": "hair-style@14",
				"label": "波波头",
				"value": "bob hair",
				"image": ""
			},
			{
				"key": "hair-style@15",
				"label": "爆炸头",
				"value": "afro",
				"image": ""
			},
			{
				"key": "hair-style@16",
				"label": "中分头",
				"value": "center parting",
				"image": ""
			},
			{
				"key": "hair-style@17",
				"label": "侧分",
				"value": "slicked back",
				"image": ""
			},
			{
				"key": "hair-style@18",
				"label": "丸子头",
				"value": "hair bun",
				"image": ""
			},
			{
				"key": "hair-style@19",
				"label": "双丸子头",
				"value": "double bun",
				"image": ""
			},
			{
				"key": "hair-style@20",
				"label": "公主卷",
				"value": "drill hair",
				"image": ""
			},
			{
				"key": "hair-style@21",
				"label": "露颈盘发",
				"value": "chignon",
				"image": ""
			},
			{
				"key": "hair-style@22",
				"label": "丸子头（和风）",
				"value": "updo hair",
				"image": ""
			},
			{
				"key": "hair-style@23",
				"label": "编织发髻",
				"value": "braided bun",
				"image": ""
			},
			{
				"key": "hair-style@24",
				"label": "多重束发（多绑发带）",
				"value": "multi-tied hair",
				"image": ""
			},
			{
				"key": "hair-style@25",
				"label": "湿发",
				"value": "wet hair",
				"image": ""
			},
			{
				"key": "hair-style@26",
				"label": "大体积蓬松头发",
				"value": "big hair",
				"image": ""
			},
			{
				"key": "hair-style@27",
				"label": "遮眼发",
				"value": "hair over one eye",
				"image": ""
			},
			{
				"key": "hair-style@28",
				"label": "辫子",
				"value": "braid",
				"image": ""
			},
			{
				"key": "hair-style@29",
				"label": "双辫子",
				"value": "twin braids",
				"image": ""
			},
			{
				"key": "hair-style@30",
				"label": "法式辫",
				"value": "french braid",
				"image": ""
			},
			{
				"key": "hair-style@31",
				"label": "冠型编织",
				"value": "crown braid",
				"image": ""
			},
			{
				"key": "hair-style@32",
				"label": "短马尾",
				"value": "short ponytail",
				"image": ""
			},
			{
				"key": "hair-style@33",
				"label": "高马尾",
				"value": "high ponytail",
				"image": ""
			},
			{
				"key": "hair-style@34",
				"label": "双马尾",
				"value": "twintails",
				"image": ""
			},
			{
				"key": "hair-style@35",
				"label": "呆毛",
				"value": "ahoge",
				"image": ""
			},
			{
				"key": "hair-style@36",
				"label": "蜂箱发型",
				"value": "beehive hairdo",
				"image": ""
			},
			{
				"key": "hair-style@37",
				"label": "进气口（m毛）",
				"value": "hair intakes",
				"image": ""
			},
			{
				"key": "hair-style@38",
				"label": "单侧发髻",
				"value": "single side bun",
				"image": ""
			},
			{
				"key": "hair-style@39",
				"label": "撩到耳后",
				"value": "hair behind ear",
				"image": ""
			},
			{
				"key": "hair-style@40",
				"label": "眼睛间的头发",
				"value": "hair between eyes",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-style",
		"name": "服装-全套",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-style@1",
				"label": "连衣裙",
				"value": "dress",
				"image": ""
			},
			{
				"key": "clothes-style@2",
				"label": "休闲装",
				"value": "casual clothes",
				"image": ""
			},
			{
				"key": "clothes-style@3",
				"label": "职业装",
				"value": "business suit",
				"image": ""
			},
			{
				"key": "clothes-style@4",
				"label": "职业女装",
				"value": "business suit dress",
				"image": ""
			},
			{
				"key": "clothes-style@5",
				"label": "西服裙",
				"value": "skirt suit",
				"image": ""
			},
			{
				"key": "clothes-style@6",
				"label": "长裙",
				"value": "gown",
				"image": ""
			},
			{
				"key": "clothes-style@7",
				"label": "睡衣",
				"value": "pajamas",
				"image": ""
			},
			{
				"key": "clothes-style@8",
				"label": "睡裙",
				"value": "nightgown",
				"image": ""
			},
			{
				"key": "clothes-style@9",
				"label": "裙装",
				"value": "",
				"image": ""
			},
			{
				"key": "clothes-style@10",
				"label": "羊毛连衣裙",
				"value": "sweater dress",
				"image": ""
			},
			{
				"key": "clothes-style@11",
				"label": "婚纱",
				"value": "wedding dress",
				"image": ""
			},
			{
				"key": "clothes-style@12",
				"label": "英式高腰裙",
				"value": "empire waist dress",
				"image": ""
			},
			{
				"key": "clothes-style@13",
				"label": "酒吧侍女裙",
				"value": "dirndl",
				"image": ""
			},
			{
				"key": "clothes-style@14",
				"label": "夏日裙",
				"value": "summer dress",
				"image": ""
			},
			{
				"key": "clothes-style@15",
				"label": "叠层裙",
				"value": "layered dress",
				"image": ""
			},
			{
				"key": "clothes-style@16",
				"label": "礼服短裙",
				"value": "cocktail dress",
				"image": ""
			},
			{
				"key": "clothes-style@17",
				"label": "礼服长裙",
				"value": "evening dress",
				"image": ""
			},
			{
				"key": "clothes-style@18",
				"label": "网球裙",
				"value": "tennis",
				"image": ""
			},
			{
				"key": "clothes-style@19",
				"label": "特定场景",
				"value": "",
				"image": ""
			},
			{
				"key": "clothes-style@20",
				"label": "学生制服",
				"value": "school uniform",
				"image": ""
			},
			{
				"key": "clothes-style@21",
				"label": "军装制服",
				"value": "military uniform",
				"image": ""
			},
			{
				"key": "clothes-style@22",
				"label": "乐队制服",
				"value": "band uniform",
				"image": ""
			},
			{
				"key": "clothes-style@23",
				"label": "店员制服",
				"value": "employee uniform",
				"image": ""
			},
			{
				"key": "clothes-style@24",
				"label": "快餐制服",
				"value": "fastfood uniform",
				"image": ""
			},
			{
				"key": "clothes-style@25",
				"label": "机车制服",
				"value": "locomotive uniform",
				"image": ""
			},
			{
				"key": "clothes-style@26",
				"label": "消防员外套",
				"value": "firefighter jacket",
				"image": ""
			},
			{
				"key": "clothes-style@27",
				"label": "健身服",
				"value": "gym uniform",
				"image": ""
			},
			{
				"key": "clothes-style@28",
				"label": "工装背带裤",
				"value": "overalls",
				"image": ""
			},
			{
				"key": "clothes-style@29",
				"label": "连衫裤",
				"value": "jumpsuit",
				"image": ""
			},
			{
				"key": "clothes-style@30",
				"label": "紧身衣",
				"value": "bodysuit",
				"image": ""
			},
			{
				"key": "clothes-style@31",
				"label": "紧身胶衣",
				"value": "latex bodysuit",
				"image": ""
			},
			{
				"key": "clothes-style@32",
				"label": "水手式学生服",
				"value": "serafuku",
				"image": ""
			},
			{
				"key": "clothes-style@33",
				"label": "水手服",
				"value": "sailor suit",
				"image": ""
			},
			{
				"key": "clothes-style@34",
				"label": "泳装",
				"value": "swimsuit",
				"image": ""
			},
			{
				"key": "clothes-style@35",
				"label": "潜水服",
				"value": "diving suit",
				"image": ""
			},
			{
				"key": "clothes-style@36",
				"label": "宇航服",
				"value": "space suit",
				"image": ""
			},
			{
				"key": "clothes-style@37",
				"label": "兔女郎",
				"value": "bunny girl",
				"image": ""
			},
			{
				"key": "clothes-style@38",
				"label": "圣诞装",
				"value": "santa coat",
				"image": ""
			},
			{
				"key": "clothes-style@39",
				"label": "外骨骼",
				"value": "exoskeleton",
				"image": ""
			},
			{
				"key": "clothes-style@40",
				"label": "机甲衣",
				"value": "mech suit",
				"image": ""
			},
			{
				"key": "clothes-style@41",
				"label": "防弹盔甲",
				"value": "body armor",
				"image": ""
			},
			{
				"key": "clothes-style@42",
				"label": "生化服",
				"value": "hazmat suit",
				"image": ""
			},
			{
				"key": "clothes-style@43",
				"label": "实验服",
				"value": "labcoat",
				"image": ""
			},
			{
				"key": "clothes-style@44",
				"label": "雨衣",
				"value": "raincoat",
				"image": ""
			},
			{
				"key": "clothes-style@45",
				"label": "民俗风情",
				"value": "",
				"image": ""
			},
			{
				"key": "clothes-style@46",
				"label": "唐装",
				"value": "chinese clothes",
				"image": ""
			},
			{
				"key": "clothes-style@47",
				"label": "旗袍",
				"value": "china dress",
				"image": ""
			},
			{
				"key": "clothes-style@48",
				"label": "和服",
				"value": "japanese clothes",
				"image": ""
			},
			{
				"key": "clothes-style@49",
				"label": "韩服",
				"value": "hanbok",
				"image": ""
			},
			{
				"key": "clothes-style@50",
				"label": "修道服",
				"value": "religious habit",
				"image": ""
			},
			{
				"key": "clothes-style@51",
				"label": "民国风",
				"value": "chinese tunic suit",
				"image": ""
			},
			{
				"key": "clothes-style@52",
				"label": "日本铠甲",
				"value": "samurai armor",
				"image": ""
			},
			{
				"key": "clothes-style@53",
				"label": "圣殿骑士",
				"value": "knights templar",
				"image": ""
			},
			{
				"key": "clothes-style@54",
				"label": "野人服",
				"value": "sarong",
				"image": ""
			},
			{
				"key": "clothes-style@55",
				"label": "印度女孩",
				"value": "sari",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-coat",
		"name": "服装-上身",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-coat@1",
				"label": "卫衣",
				"value": "hoodie",
				"image": ""
			},
			{
				"key": "clothes-coat@2",
				"label": "夹克",
				"value": "jacket",
				"image": ""
			},
			{
				"key": "clothes-coat@3",
				"label": "毛衣",
				"value": "sweater",
				"image": ""
			},
			{
				"key": "clothes-coat@4",
				"label": "衬衫",
				"value": "shirt",
				"image": ""
			},
			{
				"key": "clothes-coat@5",
				"label": "T恤",
				"value": "T shirt",
				"image": ""
			},
			{
				"key": "clothes-coat@6",
				"label": "羽绒服",
				"value": "down jacket",
				"image": ""
			},
			{
				"key": "clothes-coat@7",
				"label": "高领大衣",
				"value": "high collar coat",
				"image": ""
			},
			{
				"key": "clothes-coat@8",
				"label": "围裙",
				"value": "apron",
				"image": ""
			},
			{
				"key": "clothes-coat@9",
				"label": "马甲",
				"value": "waistcoat",
				"image": ""
			},
			{
				"key": "clothes-coat@10",
				"label": "编制款毛衣",
				"value": "aran sweater",
				"image": ""
			},
			{
				"key": "clothes-coat@11",
				"label": "羊毛衫",
				"value": "cardigan",
				"image": ""
			},
			{
				"key": "clothes-coat@12",
				"label": "风衣",
				"value": "trench coat",
				"image": ""
			},
			{
				"key": "clothes-coat@13",
				"label": "披风",
				"value": "cape",
				"image": ""
			},
			{
				"key": "clothes-coat@14",
				"label": "兜帽斗篷",
				"value": "hooded cloak",
				"image": ""
			},
			{
				"key": "clothes-coat@15",
				"label": "田径夹克",
				"value": "track jacket",
				"image": ""
			},
			{
				"key": "clothes-coat@16",
				"label": "皮夹克",
				"value": "leather jacket",
				"image": ""
			},
			{
				"key": "clothes-coat@17",
				"label": "透明夹克",
				"value": "see through jacket",
				"image": ""
			},
			{
				"key": "clothes-coat@18",
				"label": "袖肩分离装",
				"value": "detached sleeves",
				"image": ""
			},
			{
				"key": "clothes-coat@19",
				"label": "女用背心",
				"value": "tank top",
				"image": ""
			},
			{
				"key": "clothes-coat@20",
				"label": "吊带背心",
				"value": "camisole",
				"image": ""
			},
			{
				"key": "clothes-coat@21",
				"label": "露脐连帽衫",
				"value": "crop top hoodie",
				"image": ""
			},
			{
				"key": "clothes-coat@22",
				"label": "露背毛衣",
				"value": "backless sweater",
				"image": ""
			},
			{
				"key": "clothes-coat@23",
				"label": "无袖高领毛衣",
				"value": "sleeveless turtleneck",
				"image": ""
			},
			{
				"key": "clothes-coat@24",
				"label": "女士披肩",
				"value": "shawl",
				"image": ""
			},
			{
				"key": "clothes-coat@25",
				"label": "小披肩",
				"value": "capelet",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-pants",
		"name": "服装-下身",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-pants@1",
				"label": "牛仔裤",
				"value": "jeans",
				"image": ""
			},
			{
				"key": "clothes-pants@2",
				"label": "短裤",
				"value": "shorts",
				"image": ""
			},
			{
				"key": "clothes-pants@3",
				"label": "背带短裤",
				"value": "suspender shorts",
				"image": ""
			},
			{
				"key": "clothes-pants@4",
				"label": "长裤",
				"value": "pants",
				"image": ""
			},
			{
				"key": "clothes-pants@5",
				"label": "运动裤",
				"value": "sports pants",
				"image": ""
			},
			{
				"key": "clothes-pants@6",
				"label": "休闲裤",
				"value": "casual pants",
				"image": ""
			},
			{
				"key": "clothes-pants@7",
				"label": "裙子",
				"value": "skirt",
				"image": ""
			},
			{
				"key": "clothes-pants@8",
				"label": "铅笔裙",
				"value": "pencil skirt",
				"image": ""
			},
			{
				"key": "clothes-pants@9",
				"label": "百褶裙",
				"value": "plested skirt",
				"image": ""
			},
			{
				"key": "clothes-pants@10",
				"label": "迷你短裙",
				"value": "miniskirt",
				"image": ""
			},
			{
				"key": "clothes-pants@11",
				"label": "少女蛋糕裙",
				"value": "tiered skirt",
				"image": ""
			},
			{
				"key": "clothes-pants@12",
				"label": "女仆衬裙",
				"value": "petticoat",
				"image": ""
			},
			{
				"key": "clothes-pants@13",
				"label": "比基尼短裙",
				"value": "bikini skirt",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-underwear",
		"name": "服装-内衣",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-underwear@1",
				"label": "内衣",
				"value": "underwear",
				"image": ""
			},
			{
				"key": "clothes-underwear@2",
				"label": "运动内衣",
				"value": "sports bra",
				"image": ""
			},
			{
				"key": "clothes-underwear@3",
				"label": "抹胸",
				"value": "bandeau",
				"image": ""
			},
			{
				"key": "clothes-underwear@4",
				"label": "晨衣",
				"value": "negligee",
				"image": ""
			},
			{
				"key": "clothes-underwear@5",
				"label": "比基尼",
				"value": "bikini",
				"image": ""
			},
			{
				"key": "clothes-underwear@6",
				"label": "圣诞比基尼",
				"value": "santa bikini",
				"image": ""
			},
			{
				"key": "clothes-underwear@7",
				"label": "连裤紧身衣",
				"value": "bodystocking",
				"image": ""
			},
			{
				"key": "clothes-underwear@8",
				"label": "紧身胸衣",
				"value": "corset",
				"image": ""
			},
			{
				"key": "clothes-underwear@9",
				"label": "丁字裤",
				"value": "thong",
				"image": ""
			},
			{
				"key": "clothes-underwear@10",
				"label": "日式兜裆布",
				"value": "fundoshi",
				"image": ""
			},
			{
				"key": "clothes-underwear@11",
				"label": "性感内衣",
				"value": "sexy lingerie",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-shoes",
		"name": "服装-鞋子",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-shoes@1",
				"label": "运动鞋",
				"value": "sneakers",
				"image": ""
			},
			{
				"key": "clothes-shoes@2",
				"label": "系带鞋",
				"value": "cross laced footwear",
				"image": ""
			},
			{
				"key": "clothes-shoes@3",
				"label": "高跟鞋",
				"value": "high heels",
				"image": ""
			},
			{
				"key": "clothes-shoes@4",
				"label": "拖鞋",
				"value": "slippers",
				"image": ""
			},
			{
				"key": "clothes-shoes@5",
				"label": "靴子",
				"value": "boots",
				"image": ""
			},
			{
				"key": "clothes-shoes@6",
				"label": "长筒靴",
				"value": "thigh boots",
				"image": ""
			},
			{
				"key": "clothes-shoes@7",
				"label": "玛丽珍鞋",
				"value": "mary janes",
				"image": ""
			},
			{
				"key": "clothes-shoes@8",
				"label": "木底凉鞋",
				"value": "clog sandals",
				"image": ""
			},
			{
				"key": "clothes-shoes@9",
				"label": "动物拖鞋",
				"value": "animal slippers",
				"image": ""
			},
			{
				"key": "clothes-shoes@10",
				"label": "松糕鞋",
				"value": "platform footwear",
				"image": ""
			},
			{
				"key": "clothes-shoes@11",
				"label": "女巫尖头鞋",
				"value": "pointy shoes",
				"image": ""
			},
			{
				"key": "clothes-shoes@12",
				"label": "芭蕾舞鞋",
				"value": "ballet slippers",
				"image": ""
			},
			{
				"key": "clothes-shoes@13",
				"label": "木屐",
				"value": "geta",
				"image": ""
			},
			{
				"key": "clothes-shoes@14",
				"label": "雨靴",
				"value": "rubber boots",
				"image": ""
			}
		]
	},
	{
		"key": "clothes-hat",
		"name": "服装-帽子",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "clothes-hat@1",
				"label": "针织帽",
				"value": "beanie",
				"image": ""
			},
			{
				"key": "clothes-hat@2",
				"label": "太阳帽",
				"value": "boater hat",
				"image": ""
			},
			{
				"key": "clothes-hat@3",
				"label": "遮阳帽",
				"value": "visor cap",
				"image": ""
			},
			{
				"key": "clothes-hat@4",
				"label": "鸭舌帽",
				"value": "peaked cap",
				"image": ""
			},
			{
				"key": "clothes-hat@5",
				"label": "棒球帽",
				"value": "baseball cap",
				"image": ""
			},
			{
				"key": "clothes-hat@6",
				"label": "拿破仑帽",
				"value": "bicorne",
				"image": ""
			},
			{
				"key": "clothes-hat@7",
				"label": "圆顶礼帽",
				"value": "bowler hat",
				"image": ""
			},
			{
				"key": "clothes-hat@8",
				"label": "报童帽",
				"value": "cabbie hat",
				"image": ""
			},
			{
				"key": "clothes-hat@9",
				"label": "渔夫帽",
				"value": "bucket hat",
				"image": ""
			},
			{
				"key": "clothes-hat@10",
				"label": "侦探帽",
				"value": "fedora",
				"image": ""
			},
			{
				"key": "clothes-hat@11",
				"label": "牛仔帽",
				"value": "cowboy hat",
				"image": ""
			},
			{
				"key": "clothes-hat@12",
				"label": "厨师帽",
				"value": "chef hat",
				"image": ""
			},
			{
				"key": "clothes-hat@13",
				"label": "军官帽",
				"value": "military hat",
				"image": ""
			},
			{
				"key": "clothes-hat@14",
				"label": "圣诞帽",
				"value": "santa hat",
				"image": ""
			},
			{
				"key": "clothes-hat@15",
				"label": "派对帽",
				"value": "party hat",
				"image": ""
			},
			{
				"key": "clothes-hat@16",
				"label": "安全帽",
				"value": "hardhat",
				"image": ""
			},
			{
				"key": "clothes-hat@17",
				"label": "棒球头盔",
				"value": "baseball helmet",
				"image": ""
			},
			{
				"key": "clothes-hat@18",
				"label": "橄榄球头盔",
				"value": "football helmet",
				"image": ""
			},
			{
				"key": "clothes-hat@19",
				"label": "动物头盔",
				"value": "animal helmet",
				"image": ""
			},
			{
				"key": "clothes-hat@20",
				"label": "女巫帽",
				"value": "witch hat",
				"image": ""
			},
			{
				"key": "clothes-hat@21",
				"label": "贝雷帽",
				"value": "beret",
				"image": ""
			},
			{
				"key": "clothes-hat@22",
				"label": "草帽",
				"value": "straw hat",
				"image": ""
			}
		]
	},
	{
		"key": "face-ear",
		"name": "五官-耳朵",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "face-ear@1",
				"label": "动物耳朵",
				"value": "animal ears",
				"image": ""
			},
			{
				"key": "face-ear@2",
				"label": "猫耳朵",
				"value": "cat ears",
				"image": ""
			},
			{
				"key": "face-ear@3",
				"label": "狐狸耳朵",
				"value": "fox ears",
				"image": ""
			},
			{
				"key": "face-ear@4",
				"label": "狼耳朵",
				"value": "wolf ears",
				"image": ""
			},
			{
				"key": "face-ear@5",
				"label": "兔子耳朵",
				"value": "bunny ears",
				"image": ""
			},
			{
				"key": "face-ear@6",
				"label": "熊耳朵",
				"value": "bear ears",
				"image": ""
			},
			{
				"key": "face-ear@7",
				"label": "老虎耳朵",
				"value": "tiger ears",
				"image": ""
			},
			{
				"key": "face-ear@8",
				"label": "精灵耳朵",
				"value": "elf ears",
				"image": ""
			},
			{
				"key": "face-ear@9",
				"label": "树精耳朵",
				"value": "dryad ears",
				"image": ""
			},
			{
				"key": "face-ear@10",
				"label": "胡须",
				"value": "beard",
				"image": ""
			},
			{
				"key": "face-ear@11",
				"label": "小胡子",
				"value": "mustache",
				"image": ""
			},
			{
				"key": "face-ear@12",
				"label": "山羊胡",
				"value": "goatee",
				"image": ""
			},
			{
				"key": "face-ear@13",
				"label": "长鬓角",
				"value": "long sideburns",
				"image": ""
			}
		]
	},
	{
		"key": "lens-angle",
		"name": "镜头角度",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "lens-angle@1",
				"label": "俯视",
				"value": "(Top-View:1.3)",
				"image": ""
			},
			{
				"key": "lens-angle@2",
				"label": "高角度",
				"value": "(high angle:1.6)",
				"image": ""
			},
			{
				"key": "lens-angle@3",
				"label": "水平拍摄",
				"value": "straight on",
				"image": ""
			},
			{
				"key": "lens-angle@4",
				"label": "低视角",
				"value": "(low view:1.4)",
				"image": ""
			},
			{
				"key": "lens-angle@5",
				"label": "极端低视角",
				"value": "(extremely low angle of view:1.7)",
				"image": ""
			}
		]
	},
	{
		"key": "lens-distance",
		"name": "镜头远近",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "lens-distance@1",
				"label": "特写",
				"value": "(close up:1.5)",
				"image": ""
			},
			{
				"key": "lens-distance@2",
				"label": "中景特写",
				"value": "(medium close up:1.5)",
				"image": ""
			},
			{
				"key": "lens-distance@3",
				"label": "上半身",
				"value": "(upper body:1.5)",
				"image": ""
			},
			{
				"key": "lens-distance@4",
				"label": "中景",
				"value": "(medium shot:1.3)",
				"image": ""
			}
		]
	},
	{
		"key": "lens-effects",
		"name": "镜头效果",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "lens-effects@1",
				"label": "超侧角",
				"value": "(super side angle:1.3)",
				"image": ""
			},
			{
				"key": "lens-effects@2",
				"label": "电影镜头",
				"value": "(cinematic shot:1.5)",
				"image": ""
			},
			{
				"key": "lens-effects@3",
				"label": "景深",
				"value": "(depth of field:1.5)",
				"image": ""
			},
			{
				"key": "lens-effects@4",
				"label": "广角镜头",
				"value": "(wide angle view:1.5)",
				"image": ""
			},
			{
				"key": "lens-effects@5",
				"label": "超广角",
				"value": "(ultra-wide angle:1.7)",
				"image": ""
			},
			{
				"key": "lens-effects@6",
				"label": "过肩景",
				"value": "(over the shoulder shot:1.6)",
				"image": ""
			},
			{
				"key": "lens-effects@7",
				"label": "鱼眼镜头",
				"value": "(fisheye:1.4)",
				"image": ""
			},
			{
				"key": "lens-effects@8",
				"label": "体积雾",
				"value": "(volumetric fog:1.5)",
				"image": ""
			},
			{
				"key": "lens-effects@9",
				"label": "微距摄影",
				"value": "(macro photography:1.7)",
				"image": ""
			},
			{
				"key": "lens-effects@10",
				"label": "极端特写视图",
				"value": "(extreme close view:1.7)",
				"image": ""
			}
		]
	},
	{
		"key": "emote",
		"name": "表情",
		"requirement": "（单选项，如无特别要求，可不选）",
		"options": [
			{
				"key": "emote@1",
				"label": "快乐",
				"value": "(happy expression:1.2)\\(Laugh heartily, happy look\\)",
				"image": ""
			},
			{
				"key": "emote@2",
				"label": "困倦",
				"value": "(sleepy expression:1.2)\\(drowsy, tired, fatigued\\)",
				"image": ""
			},
			{
				"key": "emote@3",
				"label": "惊讶",
				"value": "(surprised expression:1.2)\\(astonished, amazed, startled\\)",
				"image": ""
			},
			{
				"key": "emote@4",
				"label": "自信",
				"value": "(confident expression:1.2)\\(confident, self-assured, triumphant,smile\\)",
				"image": ""
			},
			{
				"key": "emote@5",
				"label": "愤怒",
				"value": "(angry expression:1.3)\\(furious, irritated, annoyed\\)",
				"image": ""
			},
			{
				"key": "emote@6",
				"label": "悲伤",
				"value": "(sad expression:1.4)\\(sorrowful, downcast, melancholic\\)",
				"image": ""
			},
			{
				"key": "emote@7",
				"label": "困惑",
				"value": "(confused expression:1.5)\\( puzzled, perplexed, resting chin in hand\\)",
				"image": ""
			},
			{
				"key": "emote@8",
				"label": "厌恶",
				"value": "(disgusted expression:1.6)\\(repulsed, extremely aversion, frown\\)",
				"image": ""
			},
			{
				"key": "emote@9",
				"label": "害羞",
				"value": "(embarrassed expression:1.6)\\(bashful, shy, blushing\\)",
				"image": ""
			},
			{
				"key": "emote@10",
				"label": "焦急",
				"value": "(anxious expression:1.7)\\(worried, Extreme Anxiety, Biting lips,frown\\)",
				"image": ""
			},
			{
				"key": "emote@11",
				"label": "恐惧",
				"value": "(fearful expression:1.8)\\(afraid, extremely terrified, open eyes wide,frown\\)",
				"image": ""
			},
			{
				"key": "emote@12",
				"label": "沉思",
				"value": "(thoughtful expression:1.8)\\(pensive, contemplative, reflective,frown\\)",
				"image": ""
			},
			{
				"key": "emote@13",
				"label": "兴奋",
				"value": "(excited expression:1.8)\\(thrilled, ecstatic, elated, ehthusiastic\\)",
				"image": ""
			},
			{
				"key": "emote@14",
				"label": "邪恶的笑",
				"value": "(evil smile:1.8)",
				"image": ""
			},
			{
				"key": "emote@15",
				"label": "流口水",
				"value": "(drooling:1.5)",
				"image": ""
			},
			{
				"key": "emote@16",
				"label": "青筋凸起",
				"value": "(anger vein:1.6)",
				"image": ""
			}
		]
	}
]