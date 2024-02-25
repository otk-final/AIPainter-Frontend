import { fs, path } from "@tauri-apps/api";
import { v4 as uuid } from "uuid"

/**
 * 加载剪映草稿模版
 * @param filepath 
 * @returns 
 */
const loadJYDraftTemplate = async (filepath: string) => {
    let template_path = await path.resolveResource(filepath)
    return JSON.parse(await fs.readTextFile(template_path))
}

export interface KeyFragment {
    id: number
    name: string,
    srt: string,
    duration: number,

    image_path: string,
    audio_path: string,
    video_path: string,
}


//导出剪映草稿
export const JYMetaDraftExport = async (draft_dir: string, items: KeyFragment[], srtpath: string) => {

    let now = new Date();
    let now_time = now.getTime()
    let now_time_s = Math.floor(now_time / 1000)
    let now_time_ms = now_time * 1000


    //草稿名称 = 目录名称
    let draft_name = await path.basename(draft_dir)
    //素材模版
    let root_meta: any = await loadJYDraftTemplate("resources/jy_drafts/draft_meta_info.json")

    //累计时长 转换微秒
    items.forEach(e => e.duration = e.duration * 1000)
    let total_duration = items.map(item => item.duration).reduce((p, c) => p + c)

    /**
     * 
     * draft_meta_info.json
     * 素材准备
     * 视频 + 字幕
     */
    let material_video_template: any = await loadJYDraftTemplate("resources/jy_drafts/materials/video.json")

    //视频
    let video_templates = []
    for (let i = 0; i < items.length; i++) {
        let kf = items[i]
        let template = {
            ...material_video_template,
            id: uuid(),
            duration: kf.duration,
            file_Path: kf.video_path,
            extra_info: await path.basename(kf.video_path),
            roughcut_time_range: {
                duration: kf.duration,
                start: 0
            },
            import_time: now_time_s,
            import_time_ms:now_time_ms
        }
        video_templates.push(template)
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
        { type: 0, value: video_templates },
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


    //字幕集
    let text_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/text.json")
    let text_content_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/text_content.json")
    root_content.materials.texts = items.map((item) => {
        let text = { ...text_content_template, text: item.srt }
        return { ...text_template, id: uuid(), content: JSON.stringify(text), font_path: "" }
    })

    //视频集
    let video_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/video.json")
    let videos = []
    for (let i = 0; i < items.length; i++) {
        videos.push({
            ...video_template,
            id: uuid(),
            duration: items[i].duration,
            material_name: await path.basename(items[i].video_path),
            path: items[i].video_path
        })
    }
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

    let text_segment_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_text_segment.json")
    let video_segment_template: any = await loadJYDraftTemplate("resources/jy_drafts/contents/track_video_segment.json")

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
            }
        }
        video_track.segments.push(vs)

        //轨道时间累计顺延
        next_start_time = next_start_time + duration
    }

    root_content.tracks = [text_track, video_track]
    root_content.id = uuid()
    root_content.duration = total_duration

    await fs.writeTextFile(await path.join(draft_dir, "draft_content.json"), JSON.stringify(root_content), { append: false })

    //写入封面图
    await fs.copyFile(items[0].image_path, draft_dir + path.sep + "draft_cover.jpg", { append: false })
}


