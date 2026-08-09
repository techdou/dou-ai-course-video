// 竖版术语贴片（暖橙活力几何）
// 自然盒 320x420；属性：badgeNum, termEn, termZh, category, accent, bgColor, bgOpacity, borderColor, textColor, secondary
// 用法：create_motion_graphic_from_code 创建资产后，edit_item 放置（left 48 / top 300），propertyOverrides 填每处文字
const Component = ({ item }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { badgeNum, termEn, termZh, category, accent, bgColor, bgOpacity, borderColor, textColor, secondary } = item.props;
  const hexToRgba = (hex, a) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  };
  const exitStart = durationInFrames - 20;
  const enter = Math.min(1, Math.max(0, (frame - 2) / 24));
  const fadeOut = frame > exitStart ? Math.max(0, 1 - (frame - exitStart) / 20) : 1;
  const badgeScale = 0.94 + 0.06 * Math.min(1, Math.max(0, (frame - 6) / 16));
  const rootStyle = { position: "absolute", inset: 0, backgroundColor: "transparent", fontFamily: "Inter" };
  return (
    <div style={rootStyle}>
      <div style={{ position: "absolute", left: 8, top: 8, right: 8, bottom: 8, display: "flex", flexDirection: "column", padding: "28px 22px 22px", backgroundColor: hexToRgba(bgColor, bgOpacity), borderRadius: 18, border: "2px solid " + hexToRgba(borderColor, 0.9), opacity: fadeOut, transform: "translateY(" + (1 - fadeOut) * 10 + "px)" }}>
        <div style={{ position: "absolute", left: 18, right: 18, top: 0, height: 8, backgroundColor: accent, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 76, height: 76, borderRadius: 18, backgroundColor: accent, display: "flex", alignItems: "center", justifyContent: "center", transform: "scale(" + badgeScale + ")" }}>
            <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 38, lineHeight: 1 }}>{badgeNum}</span>
          </div>
          <span style={{ color: accent, fontWeight: 700, fontSize: 17, lineHeight: 1.1, letterSpacing: 1.2 }}>{category}</span>
        </div>
        <div style={{ marginTop: 24, color: textColor, fontWeight: 800, fontSize: 38, lineHeight: 1.14, letterSpacing: -0.5, whiteSpace: "normal", overflowWrap: "break-word", opacity: enter, transform: "translateY(" + (1 - enter) * 10 + "px)" }}>{termEn}</div>
        <div style={{ marginTop: 16, color: secondary, fontWeight: 600, fontSize: 23, lineHeight: 1.55, whiteSpace: "normal", overflowWrap: "break-word", opacity: enter }}>{termZh}</div>
      </div>
    </div>
  );
};
