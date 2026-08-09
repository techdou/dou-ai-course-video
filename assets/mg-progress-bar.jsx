// 分段进度条（标题版，暖橙活力几何）
// 自然盒 1920x104；放在最顶层轨道，from=0，duration=整片时长
// 属性：marks（分段比例，逗号分隔 0-1）、labels（分段标题，逗号分隔）、accent、trackColor、
//       labelColor、activeTextColor、barHeight、showPercent
const Component = ({ item }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { marks, labels, accent, trackColor, labelColor, activeTextColor, barHeight, showPercent } = item.props;
  const W = 1920;
  const H = 104;
  const padX = 48;
  const gap = 8;
  const textW = showPercent ? 92 : 0;
  const usable = W - padX * 2 - textW;
  const barTop = Math.round((H - barHeight) / 2);
  const progress = Math.max(0, Math.min(1, (frame + 1) / durationInFrames));
  const parsed = (marks || "")
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 1);
  const points = parsed.length >= 2 ? Array.from(new Set([0].concat(parsed, [1]))).sort((a, b) => a - b) : [0, 1];
  const labelList = (labels || "").split(",").map((s) => s.trim());
  const enter = Math.min(1, Math.max(0, (frame - 16) / 22));
  const rootStyle = { position: "absolute", inset: 0, backgroundColor: "transparent", fontFamily: "Inter" };
  return (
    <div style={rootStyle}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H, opacity: enter, transform: "translateY(" + (1 - enter) * -8 + "px)" }}>
        {points.slice(0, -1).map((start, i) => {
          const end = points[i + 1];
          const left = padX + start * usable;
          const segW = Math.max(0, (end - start) * usable - gap);
          const fill = progress >= end ? 1 : progress > start ? (progress - start) / (end - start) : 0;
          const label = labelList[i] || "";
          const textColor = fill >= 0.5 ? activeTextColor : labelColor;
          return (
            <div key={i} style={{ position: "absolute", left: left, top: barTop, width: segW, height: barHeight, borderRadius: 12, backgroundColor: trackColor, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: segW * fill, height: barHeight, backgroundColor: accent }} />
              <span style={{ position: "relative", color: textColor, fontWeight: 800, fontSize: 21, letterSpacing: 0.2, whiteSpace: "nowrap", padding: "0 8px" }}>{label}</span>
            </div>
          );
        })}
        {showPercent ? (
          <div style={{ position: "absolute", right: padX, top: 0, height: H, display: "flex", alignItems: "center", color: labelColor, fontWeight: 800, fontSize: 22, letterSpacing: 0.3 }}>
            {Math.round(progress * 100)}%
          </div>
        ) : null}
      </div>
    </div>
  );
};
