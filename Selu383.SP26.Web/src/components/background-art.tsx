import { T } from "./tokens";

export const BackgroundArt = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: "5%", right: "8%",
      width: 500, height: 500, borderRadius: "50%",
      background: `radial-gradient(circle, ${T.greenMuted}10 0%, transparent 70%)`,
    }} />
    <div style={{
      position: "absolute", bottom: "10%", left: "5%",
      width: 400, height: 400, borderRadius: "50%",
      background: `radial-gradient(circle, ${T.warmTan}0D 0%, transparent 70%)`,
    }} />
  </div>
);
