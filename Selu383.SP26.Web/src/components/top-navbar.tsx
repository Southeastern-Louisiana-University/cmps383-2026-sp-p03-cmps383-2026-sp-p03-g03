import { T, LOGO } from "./tokens";
import { Ic } from "./icons";
import { useAppContext } from "./app-context";

export const TopNavbar = ({ tab, setTab, cartCount }: { tab: string; setTab: (t: string) => void; cartCount: number }) => {
  const { isLoggedIn, user } = useAppContext();

  const navItems = [
    { k: "home", l: "Home" },
    { k: "order", l: "Menu" },
    { k: "cart", l: "Order" },
    { k: "reserve", l: "Reservations" },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: T.white,
      borderBottom: `1px solid ${T.sand}`,
      height: 72,
      backdropFilter: "blur(12px)",
      backgroundColor: "rgba(250,246,241,0.95)",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", height: "100%",
        display: "flex", alignItems: "center",
        padding: "0 48px",
      }}>
        <button
          onClick={() => setTab("home")}
          style={{
            display: "flex", alignItems: "center", gap: 12, background: "none", border: "none",
            cursor: "pointer", padding: 0, marginRight: 64,
          }}
        >
          <img src={LOGO} alt="Caffeinated Lions" style={{
            width: 42, height: 42, objectFit: "contain",
          }} />
          <span style={{
            fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700,
            color: T.darkBrew, letterSpacing: "-0.3px", lineHeight: 1,
          }}>
            Caffeinated Lions
          </span>
        </button>

        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {navItems.map(n => (
            <button
              key={n.k}
              onClick={() => setTab(n.k)}
              className="cl-nav-link cl-focus-ring"
              style={{
                padding: "8px 20px", borderRadius: 6, border: "none",
                background: tab === n.k ? T.cream : "transparent",
                color: tab === n.k ? T.darkBrew : T.mocha,
                fontFamily: T.font, fontWeight: tab === n.k ? 600 : 500,
                fontSize: 15, cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {n.l}
              {tab === n.k && (
                <span style={{
                  position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 2, background: T.green, borderRadius: 1,
                }} />
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setTab("cart")}
            className="cl-focus-ring"
            style={{
              position: "relative", background: "none", border: "none",
              cursor: "pointer", padding: 10, borderRadius: 8,
              transition: "background 0.2s",
            }}
          >
            <Ic name="cart" size={22} color={T.darkBrew} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                background: T.green, color: T.white,
                borderRadius: "50%", width: 18, height: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, fontFamily: T.font,
              }}>{cartCount}</span>
            )}
          </button>

          <div style={{ width: 1, height: 24, background: T.sand, margin: "0 8px" }} />

          {isLoggedIn ? (
            <button
              onClick={() => setTab("profile")}
              className="cl-focus-ring"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: tab === "profile" ? T.cream : "none", border: "none",
                cursor: "pointer", padding: "6px 12px 6px 6px",
                borderRadius: 8, transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: T.darkBrew,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.white,
                }}>{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.darkBrew, fontFamily: T.font, lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: T.mocha, fontFamily: T.font, lineHeight: 1.2 }}>{user.points} pts</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setTab("auth")}
              className="cl-btn-primary cl-focus-ring"
              style={{
                background: T.green, color: T.white, border: "none", borderRadius: T.rSm,
                padding: "10px 24px", fontFamily: T.font, fontWeight: 600, fontSize: 14,
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
