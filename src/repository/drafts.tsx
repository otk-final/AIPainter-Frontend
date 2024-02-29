import { fs, path } from "@tauri-apps/api";
import { v4 as uuid } from "uuid"
import { BaisicSettingConfiguration } from "./setting";

/**
 * 加载剪映草稿模版
 * @param filepath 
 * @returns 
 */
const loadJYDraftTemplate = async (filepath: string) => {
    let template_path = await path.resolveResource(filepath)
    return JSON.parse(await fs.readTextFile(template_path))
}
export interface KeyFragmentEffect {
    orientation: string
}


export interface KeyFragment {
    id: number
    name: string,
    srt: string,
    duration: number,

    image_path: string,
    audio_path: string,
    video_path: string,
    effect: KeyFragmentEffect
}


//导出剪映草稿
export const JYMetaDraftExport = async (draft_dir: string, items: KeyFragment[], srtpath: string, settingRepo: BaisicSettingConfiguration) => {

    let now = new Date();
    let now_time = now.getTime()
    let now_time_s = Math.floor(now_time / 1000)
    let now_time_ms = now_time * 1000


    //草稿名称 = 目录名称
    let draft_name = await path.basename(draft_dir)
    //素材模版
    let root_meta: any = await loadJYDraftTemplate("resources/jy_drafts/draft_meta_info.json")

    //累计时长 转换微秒
    //items.forEach(e => e.duration = e.duration * 1000)
    let total_duration = items.map(item => item.duration * 1000).reduce((p, c) => p + c)

    /**
     * 
     * draft_meta_info.json
     * 素材准备
     * 视频 + 字幕
     */
    let material_photo_template: any = await loadJYDraftTemplate("resources/jy_drafts/materials/photo.json")
    let material_audio_template: any = await loadJYDraftTemplate("resources/jy_drafts/materials/audio.json")

    //视频
    let import_materials = []
    for (let i = 0; i < items.length; i++) {
        let kf = items[i]

        //图片
        let image = {
            ...material_photo_template,
            id: uuid(),
            duration: kf.duration * 1000,
            file_Path: kf.image_path,
            extra_info: await path.basename(kf.image_path),
            import_time: now_time_s,
            import_time_ms: now_time_ms
        }
        import_materials.push(image)


        //音频
        let audio = {
            ...material_audio_template,
            id: uuid(),
            duration: kf.duration * 1000,
            file_Path: kf.audio_path,
            extra_info: await path.basename(kf.audio_path),
            roughcut_time_range: {
                duration: kf.duration * 1000,
                start: 0
            },
            import_time: now_time_s,
            import_time_ms: now_time_ms
        }
        import_materials.push(audio)
    }


    //字幕
    let material_srt_template: any = await loadJYDraftTemplate("resources/jy_drafts/materials/srt.json")
    material_srt_template.extra_info = await path.basename(srtpath)
    material_srt_template.file_Path = srtpath
    material_srt_template.id = uuid()
    material_srt_template.import_time = now_time_s
    material_srt_template.import_time_ms = -1


    //素材
    root_meta.draft_materials = [
        { type: 0, value: import_materials },
        { type: 1, value: [] },
        { type: 2, value: [{ ...material_srt_template }] },
        { type: 3, value: [] },
        { type: 6, value: [] },
        { type: 7, value: [] },
        { type: 8, value: [] }
    ]

    root_meta.draft_fold_path = draft_dir
    root_meta.draft_id = uuid()
    root_meta.draft_name = draft_name
    root_meta.draft_root_path = ""
    root_meta.draft_removable_storage_device = ""
    root_meta.tm_duration = total_duration
    root_meta.tm_draft_create = now_time_ms
    root_meta.tm_draft_modified = now_time_ms
    /**
     * 写入文件
     */
    await fs.writeTextFile(await path.join(draft_dir, "draft_meta_info.json"), JSON.stringify(root_meta), { append: false })



    //内容模版
    let root_content: any = await loadJYDraftTemplate("resources/jy_drafts/draft_content.json")

    //基础参数
    let material_animation_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/material_animation.json")
    root_content.materials.material_animations = items.map(() => {
        return { ...material_animation_template, id: uuid() }
    })
    let sound_channel_mapping_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/sound_channel_mapping.json")
    root_content.materials.sound_channel_mappings = items.map(() => {
        return { ...sound_channel_mapping_template, id: uuid() }
    })
    let speed_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/speed.json")
    root_content.materials.speeds = items.map(() => {
        return { ...speed_template, id: uuid() }
    })
    let vocal_separation_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/vocal_separation.json")
    root_content.materials.vocal_separations = items.map(() => {
        return { ...vocal_separation_template, id: uuid() }
    })
    let canvas_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/canvas.json")
    root_content.materials.canvases = items.map(() => {
        return { ...canvas_template, id: uuid() }
    })


    //视频集（图片）
    let video_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/video.json")
    //音频集
    let audio_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/audio.json")
    //字幕集
    let text_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/text.json")
    let text_content_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/text_content.json")

    let videos = []
    let texts = []
    let audios = []

    for (let i = 0; i < items.length; i++) {
        let item = items[i]

        //字幕（取当前字幕长度）
        let text_style = { ...text_content_template.styles[0], range: [0, Math.max(10, item.srt.length)] }
        let text_content = { ...text_content_template, text: item.srt, styles: [text_style] }
        let text = { ...text_template, id: uuid(), content: JSON.stringify(text_content) }
        texts.push(text)

        //图片
        let photo = {
            ...video_template,
            id: uuid(),
            duration: item.duration,

            material_name: await path.basename(item.image_path),
            path: item.image_path
        }
        videos.push(photo)

        //音频
        let audio = {
            ...audio_template,
            id: uuid(),
            duration: item.duration,
            music_id: uuid(),
            name: item.name,
            material_name: await path.basename(item.audio_path),
            path: item.audio_path
        }
        audios.push(audio)
    }
    root_content.materials.texts = texts
    root_content.materials.audios = audios
    root_content.materials.videos = videos


    let track_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track.json")
    //字幕轨道
    let text_track = {
        ...track_template,
        id: uuid(),
        segments: [],
        type: "text"
    }

    //视频轨道
    let video_track = {
        ...track_template,
        id: uuid(),
        segments: [],
        type: "video"
    }

    //音频轨道
    let audio_track = {
        ...track_template,
        id: uuid(),
        segments: [],
        type: "audio"
    }


    let text_segment_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_text_segment.json")
    let video_segment_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_video_segment.json")
    let audio_segment_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_audio_segment.json")


    let video_segment_clip_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_video_segment_chip.json")
    let video_segment_keyframe_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_video_segment_keyframe.json")


    let next_start_time = 0
    for (let i = 0; i < items.length; i++) {
        //转换为微秒
        let duration = items[i].duration * 1000

        //字幕
        let ts = {
            ...text_segment_template,
            id: uuid(),
            //root_content.materials.texts[x].id
            material_id: root_content.materials.texts[i].id,
            //root_content.materials.material_animations[x].id
            extra_material_refs: [root_content.materials.material_animations[i].id],
            //时长
            target_timerange: {
                duration: duration,
                start: next_start_time
            }
        }
        text_track.segments.push(ts)

        //视频
        let vs = {
            ...video_segment_template,
            id: uuid(),
            material_id: root_content.materials.videos[i].id,
            extra_material_refs: [
                root_content.materials.speeds[i].id,
                root_content.materials.canvases[i].id,
                root_content.materials.sound_channel_mappings[i].id,
                root_content.materials.vocal_separations[i].id,
            ],
            source_timerange: {
                duration: duration,
                start: 0,
            },
            target_timerange: {
                duration: duration,
                start: next_start_time,
            },
            //控制关键帧方向
            clip: EffectChipConvert(items[i], video_segment_clip_template),
            common_keyframes: EffectCommonKeyframesConvert(items[i], video_segment_keyframe_template)
        }
        video_track.segments.push(vs)

        //音频
        let as = {
            ...audio_segment_template,
            id: uuid(),
            material_id: root_content.materials.audios[i].id,
            extra_material_refs: [
                root_content.materials.speeds[i].id,
                root_content.materials.canvases[i].id,
                root_content.materials.sound_channel_mappings[i].id,
                root_content.materials.vocal_separations[i].id,
            ],
            source_timerange: {
                duration: duration,
                start: 0,
            },
            target_timerange: {
                duration: duration,
                start: next_start_time,
            }
        }
        audio_track.segments.push(as)

        //轨道时间累计顺延
        next_start_time = next_start_time + duration
    }

    root_content.tracks = [text_track, video_track, audio_track]
    root_content.id = uuid()
    root_content.duration = total_duration

    await fs.writeTextFile(await path.join(draft_dir, "draft_content.json"), JSON.stringify(root_content), { append: false })

    //写入封面图
    await fs.copyFile(items[0].image_path, draft_dir + path.sep + "draft_cover.jpg", { append: false })
}


let scale_offset = 0.15
let scale = 1.5

const EffectChipConvert = (item: KeyFragment, chip_template: any) => {
    let orientation = item.effect.orientation

    let transform = { x: 0, y: 0 }
    if (orientation === "up") {
        transform = { x: 0, y: -scale_offset }
    } else if (orientation === "down") {
        transform = { x: 0, y: scale_offset }
    } else if (orientation === "left") {
        transform = { x: -scale_offset, y: 0 }
    } else if (orientation === "right") {
        transform = { x: scale_offset, y: 0 }
    }
    return { ...chip_template, scale: { x: scale, y: scale }, transform: transform }
}

const EffectCommonKeyframesConvert = (item: KeyFragment, kf_template: any) => {
    let orientation = item.effect.orientation
    let duration = item.duration * 1000
    let x = {
        id: uuid(),
        keyframe_list: [] as any[],
        material_id: "",
        property_type: "KFTypePositionX"
    }
    let y = {
        id: uuid(),
        keyframe_list: [] as any[],
        material_id: "",
        property_type: "KFTypePositionY"
    }

    //移动方向
    if (orientation === "up") {
        x.keyframe_list = [{ ...kf_template, id: uuid() }, { ...kf_template, id: uuid(), time_offset: duration }]
        y.keyframe_list = [{ ...kf_template, id: uuid(), values: [-scale_offset] }, { ...kf_template, id: uuid(), time_offset: duration, values: [scale_offset] }]
    } else if (orientation === "down") {
        x.keyframe_list = [{ ...kf_template, id: uuid() }, { ...kf_template, id: uuid(), time_offset: duration }]
        y.keyframe_list = [{ ...kf_template, id: uuid(), values: [scale_offset] }, { ...kf_template, id: uuid(), time_offset: duration, values: [-scale_offset] }]
    } else if (orientation === "left") {
        x.keyframe_list = [{ ...kf_template, id: uuid(), values: [scale_offset] }, { ...kf_template, id: uuid(), time_offset: duration, values: [-scale_offset] }]
        y.keyframe_list = [{ ...kf_template, id: uuid() }, { ...kf_template, id: uuid(), time_offset: duration }]
    } else if (orientation === "right") {
        x.keyframe_list = [{ ...kf_template, id: uuid(), values: [-scale_offset] }, { ...kf_template, id: uuid(), time_offset: duration, values: [scale_offset] }]
        y.keyframe_list = [{ ...kf_template, id: uuid() }, { ...kf_template, id: uuid(), time_offset: duration }]
    }

    //缩放
    let s = {
        id: uuid(),
        keyframe_list: [{ ...kf_template, id: uuid(), values: [scale] }, { ...kf_template, id: uuid(), values: [scale], time_offset: duration }],
        material_id: "",
        property_type: "KFTypeScaleX"
    }


    return [x, y, s]
}