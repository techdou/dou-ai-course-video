---
name: dou-ai-course-video
description: 豆懂AI 课程视频剪辑模板：把口播课素材（多段录屏）从导入到导出剪成统一风格的成品课程视频（转录修正、剪口误、压缩停顿、字幕、术语贴片、章节卡、AI 生图、分段进度条、响度归一化）。当用户要求按豆懂风格完整剪辑一节课程、或用课程模板做成品课时使用。纯转录用 media-transcribe；已有时间线只做口误清理用 koubo-clean；ChatCut 项目内局部改动用 chatcut-plugin-basics；口误审查稿用 AI剪口播。触发词：用课程模板剪视频、AIGC教学课剪辑、口播课模板、豆懂模板、按照我的风格剪课、完整剪辑一节课。
---

# 豆懂 AI 课程视频剪辑模板

豆哥的个人课程视频剪辑规范。把一节口播课（通常 2 段以上录屏素材）剪成逻辑连贯、节奏紧凑、风格统一的成品课程视频，全程在 ChatCut 中完成，文字动效（Motion Graphics）用代码直编，概念插图用 image2-api 生图。

## 何时使用 / 何时不用（Agent 匹配决策）

**使用**：用户要求按豆懂风格完整剪辑课程（先导~第10节等），或提供新素材要求做成成品课；本 skill 覆盖从建项目/导入到导出+响度归一化的完整流程。

**不用（交给相邻 skill）**：
- 只要把音视频转成文字/时间戳 → `media-transcribe`
- 已有 ChatCut 时间线，只清理口误/叠字 → `koubo-clean`
- 已有项目做局部改动（挪素材、加 B-roll、改字幕样式）→ `chatcut-plugin-basics`
- 只要口误识别审查清单 → `AI剪口播`
- 不按豆懂风格、无模板要求的普通剪辑 → `chatcut-plugin-basics` / `chatcut:talking-head-guide`

## 模板家族

本 skill 按“模板家族”设计：每种课程类型是一个模板文件，放在 `templates/` 下，共享同一套工作流，各自定义风格参数。

- `templates/aigc-basic.md` —— AIGC 实战入门课（当前风格：暖橙活力几何）
- 新增模板：复制现有模板文件，改主题色、术语表、章节卡文案、生图方向即可（例如 AI 通识课、Python 教学课）

**启动检查**：接到新课时，先确认 3 件事——① 用户要哪套模板（未指定默认 `aigc-basic`）；② 新建项目还是改已有项目（改已有先看“何时不用”）；③ 素材清单与画布比例（源 16:10 → 1920×1200）。

## 工作流总览

1. **建项目**：ChatCut 新建项目，画布比例匹配素材（源 16:10 → 1920×1200）
2. **导入素材**：`import_media` 创建会话 + 官方 `upload-media.mjs` 上传；网络慢时用压缩代理 + 串行 curl 分片（见 `assets/workflow.md` 常见坑）
3. **转录**：等 `track_progress target=transcription` 就绪
4. **修正 ASR**：`manage_transcript fix` 修正错词（先 preview 探测 word 索引；按字符分词）
5. **剪口播**：`read_script` → 编辑 `timeline.md` → `apply_script`；删除重复讲解、失败重录、残句、语气词；词级错误用 `~~…~~`
6. **压缩停顿**：`clean_script only=silence silence=compress:250`
7. **字幕**：`edit_captions enable` + 套用模板字幕样式（见 `assets/captions-style.md`）；用 `assets/glossary.md` 品牌词对照表扫描全部字幕卡，统一变体，发现新变体先确认再统一
8. **术语贴片**：文案优先取 `assets/glossary.md` 术语表；用 `assets/mg-*.jsx` 创建竖版贴片，放到左侧（人脸在右时），半透明柔和淡入
9. **章节卡**：image2-api 生成概念插图（prompt 见 `assets/image-prompts.md`），叠加章节标题 MG（开场/中段/结尾各 1 张，每张 4 秒）
10. **分段进度条**：用 `assets/mg-progress-bar.jsx` 创建标题版分段进度条，放最顶层轨道，from=0、duration=整片时长，按内容章节填 marks/labels（见下方“分段进度条体系”）
11. **验证**：`view_timeline_frames` 渲染关键帧，逐帧检查文字、遮挡、裁切
12. **报告**：按 `koubo-clean` 的 `references/report-template.md` 生成剪辑报告，待确认项追加到项目根目录 `pending-words.md`
13. **导出与响度归一化**：`submit_export`（1080p）→ `track_export` 等完成 → 下载本地 → 按“成片响度归一化”运行 `assets/normalize-14lufs.ps1`（默认 -14 LUFS 平台标准）→ ebur128 验证

## 风格规范（暖橙活力几何 · 默认模板）

完整 designSpec 见 `assets/design-style.json`。要点：

- 配色：强调橙 `#FF9500`；暖米底 `#F0EFED`；暖米浅橙 `#FFD580`；中性灰 `#EBEBEB`；文字 `#1A1A1A`；次级灰 `#4A4A4A`
- 字体：Inter（Google Fonts 可加载）
- 形态：纸感中性底、扁平几何块、单一饱和橙强调、粗体 Inter、编号徽章、简单节点链
- 动效：柔和淡入 + 轻微上浮（0.7–0.9s），节点依次浮现，结尾淡出；禁止弹跳、强滑动、辉光、渐变
- 禁忌：深色科技感、花哨衬线、玻璃拟态、过度装饰卡片

## 术语贴片体系

- 形式：竖版（约 320×420 自然盒），左侧放置（right/bottom 用 left/top 锚点），半透明底（bgOpacity 0.78）
- 结构：顶部橙色编号徽章 + 类别标签，中部英文术语（38px 粗体），下方中文解释（23px，行距 1.55）
- 文案：英文术语 + 一句口语化中文解释 + 类别（核心概念 / 风险提醒 / 底层机制 / 实战技能 / 课程预告）
- 密度高时（如 Skill→MCP→API→工作流 连续讲解）用竖版链路贴片替代多个标签
- 代码资产：`assets/mg-term-label.jsx`、`assets/mg-chain.jsx`

## 章节卡体系

- 每节 3 张：开场（课程总览概念图 + 节标题）、中段（主题概念图 + 章节标题）、结尾（下一节/实操预告图）
- 全屏 4 秒，图片 cover（轻微上下裁切可接受），标题文字居中偏上，与插画主体分区
- 生图方向：暖米底、扁平几何、橙色点缀、无文字无 logo、顶部/底部留白、无渐变无辉光
- 代码资产：`assets/mg-chapter-title.jsx`

## 分段进度条体系

- 形式：顶部通栏（1920×104），46px 高圆角分段条，段与段之间 8px 间隔，右上角百分比
- 结构：每段内置标题（21px 粗体），未播放段深灰字、已播放段白字，橙色随播放进度填充
- 分段：通常 4 段，按每节内容章节定比例（marks 为 0-1 逗号分隔，labels 顺序对应）；如 L2：0,0.27,0.5,0.77,1 + LLM 概念/类比与能力/幻觉边界/Token 链路
- 放置：新开最顶层视频轨道（如 V5），from=0、durationInFrames=整片总帧数，left 0 / top 0 / 1920×104
- 代码资产：`assets/mg-progress-bar.jsx`；属性：marks、labels、accent、trackColor、labelColor、activeTextColor、barHeight、showPercent

## 字幕样式

见 `assets/captions-style.md`。默认：白底黑字卡片、底部居中、单行、隐藏句尾标点。

## 成片响度归一化

**标准**：Integrated Loudness -14 LUFS（平台标准），True Peak ≤ -1.5 dBFS；脚本限幅 -2.5dB 留编码裕量。

**方法**：ChatCut 导出的 1080p 成片下载后，运行 `assets/normalize-14lufs.ps1`：

- `-Files`（必填）：mp4 路径数组；`-TargetLUFS`（可选，默认 -14），其他平台目标（如播客 -16）可传参
- 流程：提取音频 pcm_f32le → 迭代「volume 增益 + alimiter 限幅」→ 每轮 ebur128 实测偏差收敛 ±0.2 LUFS（通常 4-6 轮）→ 视频 `-c:v copy` 不重编码，音频 AAC 192k + faststart
- 输出：同目录 `<原名>-14LUFS.mp4`（按目标值取整命名）
- 验证：`ffmpeg -af ebur128=peak=true` 检查最终 I 与 TP，逐节记录源响度/成品响度/TP 汇报

**为什么不用 loudnorm**：口播源响度常低至 -20~-35 LUFS，一次提升 6~21dB 会被 loudnorm 限幅吃掉约 1.6dB 平均能量（实测只能到 -15.6 左右）；迭代法每次只补少量增益，限幅损失递减，可稳定收敛到 -14.2±0.1。

**注意**：源 True Peak 接近 0dB 的素材（如演示录屏），提升后限幅感明显属物理限制；后续若加 BGM，必须在响度处理之前混音。

## 剪辑判断标准

> 口播清理的完整决策标准见独立 skill `koubo-clean`：执行本节前必须先读取该 skill 的 SKILL.md（按 skill 名称定位），并遵循其中“该剪 / 不剪 / 执行细节”（skill 之间不支持 @ 自动注入，按名称读取）。以下为课程内联要点。

**目标**：只剪“嘴瓢”——说话卡壳、半截词改口、叠字、紧邻重复、改口残留；不删内容性/教学性重复，不擅自改语义。

**该剪（直接剪）**
- 半截词改口：一个技，一个技能包 → 一个个技能包；它也是一个插，它也是一个接口 → 它也是一个接口；告诉说，告诉这个 agent → 告诉这个 agent
- 叠字卡壳：操…作 → 操作；prompt 我们的 prompt → prompt；封装好好 → 封装好；操作操作平台 → 操作平台；把把、呃呃、自自己、一一种
- 紧邻同义重复：肯定…肯定；这个…这个；更早的开始，更早的开始；遇到相同的问题，遇到相同的问题；而不是说…而不是说；就完全的自主了 ×2
- 改口残留：那回到我们，；甚至说现在很火的，现在说；像感啊；我们…我们
- 同一层意思紧挨着说两遍：问题本身模糊，就是需求本身模糊 → 二选一保留

**不剪（保留）**
- 教学性/刻意重复：演示性“拆成…拆成…”、递进式“封装成了技能包的形式，封装成了使用说明”
- 用户明确保留：如“能力的边界，模型的边界”“两种表达方式”
- 跨句/跨段的语义重复（如“学完 10 节课能做出什么”多处出现）：先列清单给用户确认，不擅自删
- 拿不准的 ASR 疑点：保留并列入清单让用户听原话

**执行细节**
- 行内叠字用 `~~字~~`；跨多行保留一半时注意 `[sN@M]` 标识
- 删除整行时，连带清掉相邻一个 `[silence]` 标记，避免两段停顿叠加
- 每次剪完口播必须 `edit_captions refresh`，字幕与口播同步
- 字幕文本修正优先 `set_card_text`（custom override），不要改源 ASR；改源会让 timeline 行失配
- 品牌词全系列统一（如 workbuddy / Dify / Agnes / Boson / DeepSeek / Seedream / Seedance / K12 / MiMo / 助学群），发现新变体先向用户确认再统一
- `merge_cards` 不能合并不同 source item 的卡；需要拼接时用“前卡尾 + 后卡头”拆文本
- 常见坑：`apply_script` 校验可能用旧 ASR 缓存（fix 后按旧拼写写行可过校验，缓存刷新后需新拼写）；`find_transcript` 命中源转录，卡 override 不影响搜索命中

## 验证要求

每次改动后必须：

1. `read_script` 或 `read_project` 确认结构
2. `view_timeline_frames` 渲染目标帧（贴片稳定帧 +30 帧）
3. 检查：文字完整无溢出、不挡人脸/字幕、半透明生效、章节卡标题不与插画重叠
4. 导出前 ffprobe 校验时长/分辨率/码率

## 完成判定（验收清单）

以下全部满足才算完成：

1. **项目/时间线**：所有素材就位，无残留空轨，时间线与口播内容一致
2. **字幕**：套用模板字幕样式，品牌词全系列统一，与口播同步（`edit_captions refresh` 后抽查关键句）
3. **视觉层**：术语贴片/章节卡/分段进度条按模板规范放置，`view_timeline_frames` 抽查无遮挡、无溢出、无错位
4. **导出**：1080p 成片导出成功且可播放
5. **响度**：Integrated -14 LUFS ±0.2，True Peak ≤ -1.5 dBFS（`normalize-14lufs.ps1` + ebur128 验证）
6. **报告**：按 `koubo-clean` 的 report-template 输出剪辑报告；`pending-words.md` 待确认项已列出或已处理

## 常见坑（详见 assets/workflow.md）

- 上传大视频到云端慢：压 2.5Mbps 代理 + 串行 curl 分片
- MG 属性校验：代码必须直接解构 `item.props`；属性 key 必须被代码使用
- apply_script 校验用旧缓存：fix 后行文本写回旧源可过校验，播放文本仍取新源
- 资产自然盒尺寸创建后不可改：要换版式就新建资产并替换实例

## 模板扩展

新增课程模板步骤：

1. 复制 `templates/aigc-basic.md` 为 `templates/<new>.md`
2. 修改：主题色、术语表、章节卡文案、生图方向、字幕样式覆盖
3. 在 SKILL.md 模板家族列表登记，并说明触发词

## 相关工具

- ChatCut：转录、Script 剪辑、字幕、MG、导出（mcp__chatcut__*）
- image2-api：概念插图生图（按 skill 名称 `image2-api` 定位，多 provider 自动 fallback）
- 本地 ffmpeg：素材探测、压缩代理、截图拼图、成片响度归一化（`assets/normalize-14lufs.ps1`）
