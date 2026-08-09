# 概念插图生图 Prompt 库（image2-api）

统一风格基线（每条 prompt 都要包含）：

> Flat geometric illustration, warm minimal business style. Warm cream paper background (#F0EFED), flat vector shapes, one saturated orange (#FF9500) accent, subtle warm gray secondary shapes. Dark charcoal (#1A1A1A) outlines. No text, no letters, no numbers, no logos, no watermarks. Generous whitespace, suitable as a wide 16:9 background for a chapter title overlay. No gradients, no glow, no photorealism, no 3D.

## 1. AI 工作链路图（开场卡）

> Composition: a horizontal pipeline chain of eight rounded-square nodes connected by short orange arrows, left to right. Node icons (minimal flat): idea lightbulb, speech bubble (prompt), brain chip (LLM), robot head (agent), toolbox (skill), plug connection (API), interlocking gears (workflow), rocket product.

## 2. AI 大脑概念图（中段卡）

> Subject: abstract stylized human brain of simple flat geometric shapes with small connected nodes/lines, friendly and approachable. IMPORTANT composition: place the brain in the LOWER-CENTER, keep the upper 45% completely clean empty cream background for title text.

## 3. 普通人生成场景图（结尾/预告卡）

> Scene: a relaxed person at a desk with a laptop, surrounded by floating flat icons: tidy folder stack, web page, presentation slide, picture frame, short video play button. Person is a simple flat silhouette. Calm, friendly, practical mood.

## 调用命令（image2-api skill）

```powershell
$skill = Join-Path $env:AGENTS_SKILLS_DIR 'image2-api'
$py='<workspace-dependency-python>'
& $py "$skill\scripts\generate_image.py" `
  --prompt "<完整 prompt>" `
  --model image-2 --model-family gpt-image-2 `
  --prompt-profile illustration --prompt-lint warn `
  --size 1536x1024 --quality medium --count 1 `
  --output-dir '<项目临时目录>' --name '<语义名>'
```

说明：`AGENTS_SKILLS_DIR` 指向本机技能根目录（如 `C:\Users\<用户>\.agents\skills`），建议设置为用户级环境变量持久生效（见仓库 `.env.example`）；未设置时按 skill 名称 `image2-api` 定位目录。

注意：生成后必须用视觉工具检查（无文字、留白位置、主体不压标题），不合格就重生成；主 provider 满额度时脚本自动 fallback 到备用 provider。
