import { T, LOGO } from "./tokens";

export const LoyaltyCard = ({ user }: { user: { name: string; points: number } }) => (
  <div style={{
    background: T.darkBrew, borderRadius: T.rLg,
    padding: "32px", position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "rgba(255,255,255,0.02)", borderRadius: "50%" }} />
    <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.08 }}>
      <img src={LOGO} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />
    </div>

    <p style={{ color: T.caramel, fontSize: 11, fontWeight: 600, margin: "0 0 12px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: T.font }}>
      Lion's Rewards
    </p>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
      <span style={{ color: T.white, fontSize: 48, fontWeight: 700, lineHeight: 1, fontFamily: T.fontDisplay }}>{user.points}</span>
      <span style={{ color: T.caramel, fontSize: 16, fontFamily: T.font, fontWeight: 500 }}>points</span>
    </div>
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 6, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ background: T.green, height: "100%", width: `${user.points % 100}%`, borderRadius: 100, transition: "width 0.4s ease" }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: T.caramel, fontSize: 13, fontFamily: T.font }}>$1.50 available</span>
      <span style={{ color: "rgba(196,168,130,0.5)", fontSize: 12, fontFamily: T.font }}>100 pts = $1</span>
    </div>
  </div>
);
