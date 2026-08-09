# dou-ai-course-video

豆懂 AI 课程视频剪辑模板：把口播课素材（多段录屏）从导入到导出，剪成逻辑连贯、节奏紧凑、风格统一的成品课程视频。

全程在 ChatCut 中完成：转录修正、剪口误、压缩停顿、字幕、术语贴片、章节卡、分段进度条、导出、响度归一化。

## 何时使用

- 用户要求按豆懂风格完整剪辑一节课程（先导～第 10 节等）
- 提供新素材，要求做成统一风格的成品课

### 何时不用（交给相邻 skill）

| 场景 | 使用 |
| --- | --- |
| 只要把音视频转成文字/时间戳 | `media-transcribe` |
| 已有 ChatCut 时间线，只清理口误/叠字 | `koubo-clean` |
| 已有项目做局部改动（挪素材、加 B-roll、改字幕样式） | `chatcut-plugin-basics` |
| 只要口误识别审查清单 | `AI剪口播` |

## 快速开始

1. 建项目：ChatCut 新建项目，画布比例匹配素材（源 16:10 → 1920×1200）
2. 导入素材 → 等转录就绪 → 修正 ASR 错词
3. 剪口播（`read_script` → `timeline.md` → `apply_script`）→ 压缩停顿（`clean_script`）
4. 开字幕并套用模板样式 → 加术语贴片、章节卡、分段进度条
5. `view_timeline_frames` 逐帧验证 → 导出 1080p → `normalize-14lufs.ps1` 响度归一化

## 模板家族

每种课程类型是一个模板文件，放在 `templates/` 下，共享同一套工作流，各自定义风格参数。

- `templates/aigc-basic.md` —— AIGC 实战入门课（当前风格：暖橙活力几何）

新增模板：复制现有模板，改主题色、术语表、章节卡文案、生图方向，并在 SKILL.md 登记。

## 目录结构

```
dou-ai-course-video/
├── SKILL.md                  # 技能主文档（Agent 入口）
├── README.md
├── assets/                   # 运行必需资产
│   ├── captions-style.md     # 字幕样式
│   ├── design-style.json     # 风格 designSpec
│   ├── glossary.md           # 品牌词对照表
│   ├── image-prompts.md      # 章节卡生图方向
│   ├── mg-*.jsx              # Motion Graphics 代码
│   ├── normalize-14lufs.ps1  # 成片响度归一化脚本
│   └── workflow.md           # 常见坑与流程细节
└── templates/
    └── aigc-basic.md         # AIGC 实战入门课模板
```

## 依赖

- ChatCut（转录、Script 剪辑、字幕、MG、导出）
- image2-api（概念插图生图）
- 本地 ffmpeg（素材探测、压缩代理、响度归一化）

## 说明

仓库内不含本机绝对路径。`assets/image-prompts.md` 通过 `$env:AGENTS_SKILLS_DIR` 定位 image2-api 技能目录，首次使用请复制 `.env.example` 为 `.env` 或设置用户级环境变量（PowerShell 不自动读取 `.env`，推荐用户级环境变量）。
