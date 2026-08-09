// 章节标题卡（暖橙活力几何）
// 自然盒 1920x300；属性：title, subtitle, accent, textColor, secondary；放在章节概念图（V3）上层（V4）
const Component = ({ item }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { title, subtitle, accent, textColor, secondary } = item.props;
  const enter = Math.min(1, Math.max(0, (frame - 4) / 26));
  const subIn = Math.min(1, Math.max(0, (frame - 18) / 22));
  const fadeOut = frame > durationInFrames - 18 ? Math.max(0, 1 - (frame - (durationInFrames - 18)) / 18) : 1;
  const rootStyle = { position: "absolute", inset: 0, backgroundColor: "transparent", fontFamily: "Inter" };
  return (
    <div style={rootStyle}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 80px", opacity: fadeOut, transform: "translateY(" + (1 - fadeOut) * 14 + "px)" }}>
        <div style={{ width: 72, height: 8, backgroundColor: accent, borderRadius: 4, opacity: enter, transform: "scaleX(" + (0.4 + 0.6 * enter) + ")" }} />
        <div style={{ marginTop: 22, color: textColor, fontWeight: 800, fontSize: 54, lineHeight: 1.12, textAlign: "center", letterSpacing: -0.8, whiteSpace: "normal", overflowWrap: "break-word", opacity: enter, transform: "translateY(" + (1 - enter) * 16 + "px)" }}>{title}</div>
        <div style={{ marginTop: 14, color: secondary, fontWeight: 600, fontSize: 24, lineHeight: 1.3, textAlign: "center", whiteSpace: "normal", overflowWrap: "break-word", opacity: subIn, transform: "translateY(" + (1 - subIn) * 12 + "px)" }}>{subtitle}</div>
      </div>
    </div>
  );
};
