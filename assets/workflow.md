# 详细操作流程（ChatCut + 生图）

## 0. 项目准备

- ChatCut 新建项目：画布比例匹配源素材（如 2560×1600 → 1920×1200）
- 用 `create_project` 创建后立即把编辑器 URL 给用户（应用内浏览器打开，中文路径 `/zh/editor/...`）

## 1. 导入素材

```text
import_media action=create_session -> token/endpoint
node <chatcut>/skills/asset-import/scripts/upload-media.mjs --token <t> --endpoint <e> <file1> <file2> --json-out <tmp>.json
```

- 资产 ID 以 json-out 为准；转录音频先于大文件上传
- `track_progress target=transcription` 就绪后再做文本工作

## 2. 转录修正（manage_transcript fix）

- 先 `preview:true` 探测 word 索引；CJK 按单字分词，英文+标点常连成一个 token
- 探测时一次只放合法索引，任一越界会导致整批 preview 失败
- 例：`FIX [s62]: 4 -> "Prompt。"`；`FIX [s84]: 15 -> "vibe"`

## 3. Script 剪辑

```text
read_script -> timelineMd（含 [sN@M] 与 ~~删除~~ 标记）
编辑后 apply_script({timelineMd})
```

- 整行删除：删行或 `~~[sN] text~~`
- 词级删除：`[sN] keep ~~drop~~ keep`（整行必须是源文本连续子串）
- 跨视频重复衔接（如 01-1 结尾与 01-2 开头同句）：保留完整句，删残句
- fix 后 apply 校验可能仍用旧源缓存：行文本写回旧拼写可通过校验，播放文本自动取 fix 后源
- apply 后时长、片段数变化在结果 JSON 中核对

## 4. 停顿压缩

```text
clean_script only=silence silence=compress:250
```

- 会把长句按词拆成多 clip（`[sN@1]/[sN@2]`），属正常结果

## 5. 字幕

```text
edit_captions action=enable（默认样式）或按模板 presets 调整
edit_captions action=refresh 在转录修正后重建字幕
```

## 6. 术语贴片（MG）

1. `create_motion_graphic_from_code` 传 `assets/mg-term-label.jsx`（或 mg-chain.jsx），带属性 schema
2. 校验要求：组件直接解构 `item.props`；每个声明属性必须在代码中被读取；根节点 `<div style={rootStyle}>`
3. `edit_item adds` 放置：track 用顶层新轨道；位置 left 48 / top 300；propertyOverrides 填每处文案
4. 资产自然盒（width/height）创建后不可改；换版式=新建资产+替换实例+删旧资产
5. 同一轨道相邻片段不能重叠，时间冲突时调 duration 或起点

## 7. 章节卡

1. 按 `assets/image-prompts.md` 用 image2-api 生图（先 1 张代表图给用户确认方向）
2. 图片上传后放 V3 轨道全屏 4s（fit cover；3:2 图会上下各裁约 3%，主体居中即可）
3. `assets/mg-chapter-title.jsx` 标题卡放 V4 轨道，标题区与插画主体必须分区（生图 prompt 强制顶部留白）
4. 每张卡渲染验证，插画压标题就换图或调位置

## 8. 验证

- `view_timeline_frames` 渲染：贴片取“出现后 +30 帧”稳定帧；章节卡取中段帧
- 检查：文字完整、不挡人脸/字幕、贴片半透明、章节卡标题无重叠
- 视觉检查通道不可用时，明确告知用户缺口并给出时间点让其自查

## 9. 导出

```text
submit_export format=video resolution=1080p name=<文件名>
track_export action=status renderIds=<id> 直到 complete
下载 downloadUrl 到本地，ffprobe 校验时长/分辨率/码率
```

## 常见坑清单（本次实战踩过）

1. **上传大视频超时（2026-08-11 实测方案）**：本机到 S3 国际链路慢时，官方 helper 默认把同一文件分片**并行**上传（`uploadPreparedFile` 里 `Promise.all(batch)`），9 片互相抢带宽，单片约 60MB 在 120s 超时内传不完（只有单片单独跑时能过）。
   解决：复制 `skills/asset-import/scripts/upload-media.mjs` 到临时目录，改两处——
   - `UPLOAD_RETRY_ATTEMPT_TIMEOUT_MS = 120_000` → `300_000`
   - 把 `uploadPreparedFile` 里 `batch.push(...)` + `Promise.all(batch)` 改成逐片 `await uploadPart(...)` 串行循环
   然后用串行版跑：`node <serial-helper> --token <t> --endpoint <e> --asset-id <占位id> <file> --json-out ...`。
   实测：547MB / 9 片串行约 30 分钟全部成功；token 30 分钟有效期可能卡在最后 finalize（HTTP 401），换新 token 重跑同一命令收尾即可（服务端会重传全部片，但能完成）。
   注：不要用 curl 手动传分片替代 helper（asset-import 只认可 helper 流程）；串行版 helper 本质就是“切段上传”。

2. **素材补传/重新导入的转录差异（2026-08-11 实测）**：
   - 上传未完成的旧资产**无法补字节**：`--asset-id <旧id>` resume 在 `prepareRegisteredUploadRequest` / `finalizeTranscriptionAudioRequest` 均返回 HTTP 500，服务端拒绝续传。
   - 补传同一文件会生成**新 assetId + 新转录**；新转录的段落切分、标点和个别用词可能与旧转录不同（实测：行号偏移 5-6、“豆哥/豆包”、“长程/长城”、逗号位置都有差异），导致基于旧转录的 Script 精修行（`[sN]` 行号+文本）**无法无损平移到新资产**，自动文本迁移也不可靠。
   - 因此：**开始 Script 剪辑前，先 `track_progress target=upload` 确认素材云端字节就绪**；若中途补传生成新资产，要么接受用新转录重新精修，要么回退旧素材继续（旧素材将无法云渲染/云导出）。
   - 回退流程：`edit_item` delete 新 item + add 旧 asset 原范围 item → `read_script` 拿新 stamp → `apply_script` 原精修 timelineMd（H3 保持旧 asset 短 id）→ `clean_script` 重压停顿。

3. **apply_script 旧缓存**：见第 3 节；不要反复 refresh，先按旧源文本提交
4. **MG 属性校验**：属性声明与代码读取必须一一对应
5. **MG 尺寸锁定**：自然盒创建后不可改
6. **应用内浏览器标签会话会失效**：页面闪退时用 `get_editor_url` 拿新 boot token 重开；也可给用户干净外链
7. **字幕层在最顶层**：B-roll/章节卡全屏时字幕仍显示，属正常；贴片避开底部字幕条
8. **生图服务额度**：provider 有 fallback 链，但 vision 复核服务可能限额；额度恢复前用数据层验证+用户自查
