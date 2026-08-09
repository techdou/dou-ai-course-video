// 竖版链路贴片（暖橙活力几何）
// 自然盒 260x460；属性：node1..node4, caption, accent, bgColor, bgOpacity, borderColor, secondary
const Component = ({ item }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { node1, node2, node3, node4, caption, accent, bgColor, bgOpacity, borderColor, secondary } = item.props;
  const nodes = [node1, node2, node3, node4];
  const hexToRgba = (hex, a) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  };
  const exitStart = durationInFrames - 20;
  const enter = Math.min(1, Math.max(0, (frame - 2) / 22));
  const fadeOut = frame > exitStart ? Math.max(0, 1 - (frame - exitStart) / 20) : 1;
  const nodeIn = nodes.map((n, i) => Math.min(1, Math.max(0, (frame - 4 - i * 12) / 14)));
  const captionIn = Math.min(1, Math.max(0, (frame - 56) / 14));
  const rootStyle = { position: "absolute", inset: 0, backgroundColor: "transparent", fontFamily: "Inter" };
  return (
    <div style={rootStyle}>
      <div style={{ position: "absolute", left: 8, top: 8, right: 8, bottom: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 14px", backgroundColor: hexToRgba(bgColor, bgOpacity), borderRadius: 18, border: "2px solid " + hexToRgba(borderColor, 0.9), opacity: fadeOut * enter, transform: "translateY(" + (1 - fadeOut) * 10 + "px)" }}>
        {nodes.map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: nodeIn[i], transform: "scale(" + (0.92 + 0.08 * nodeIn[i]) + ")" }}>
            <div style={{ padding: "9px 14px", borderRadius: 12, backgroundColor: i === 3 ? accent : "#1A1A1A", color: "#FFFFFF", fontWeight: 800, fontSize: 17, whiteSpace: "nowrap" }}>{n}</div>
            {i < 3 ? <div style={{ width: 3, height: 18, backgroundColor: accent, margin: "4px 0", transform: "scaleY(" + Math.min(1, Math.max(0, (frame - 10 - i * 12) / 14)) + ")" }} /> : null}
          </div>
        ))}
        <div style={{ marginTop: 10, color: secondary, fontWeight: 500, fontSize: 15, textAlign: "center", lineHeight: 1.3, opacity: captionIn }}>{caption}</div>
      </div>
    </div>
  );
};
