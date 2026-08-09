# 字幕样式规范（豆懂课程）

ChatCut 字幕（`edit_captions`）默认参数，基于本课程已验证效果：

- 启用：`action=enable`，语言随源（中文）
- 预设：`off-the-wall`（Paper Stack 白底黑字卡片），风格参数：
  - 字体：Bangers 标题感（中文 fallback Smiley Sans），fontSizeRatio ≈ 0.052
  - 颜色：字 #000000、底 #FFFFFF、normalBackground padding 12/9、圆角 0
  - 显示：displayMode=stacked（堆叠纸卡），hidePunctuation=true（句尾标点隐藏）
  - 布局：居中底部，left 288 / top 967 / width 1344 / height 137（1920×1200 画布）
  - 分页：maxLines=1、maxCharactersPerLine=20（auto）
- 位置注意：底部字幕条会与右下角元素竞争，术语贴片放在左侧可避开

更换模板时如需不同字幕风格（例如 AI 通识课更克制），可在模板文件中覆盖 preset 与布局参数。
