import { useState } from "react";
import { T, LOGO, btnP, lbl, inp, noiseOverlay } from "../components/tokens";
import { Ic } from "../components/icons";
import { useAppContext } from "../components/app-context";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function AuthPage() {
  const { login, signup } = useAppContext();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = mode === "login"
        ? login(email, password)
        : signup(name, email, password);

      if (!result.ok) setError(result.error || "Something went wrong.");
      setLoading(false);
    }, 600);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 72px)", margin: "-48px -48px 0" }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <ImageWithFallback
          src={T.heroImg} alt="Coffee shop ambiance"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, rgba(58,46,31,0.92) 0%, rgba(58,46,31,0.7) 50%, rgba(74,124,89,0.4) 100%)",
        }} />
        <div style={noiseOverlay} />

        <div style={{
          position: "relative", zIndex: 1, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "64px",
        }}>
          <img src={LOGO} alt="" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 32 }} />
          <h1 style={{
            fontFamily: T.fontDisplay, fontSize: 48, fontWeight: 700,
            color: T.white, margin: "0 0 16px", lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}>
            {mode === "login" ? "Welcome\nback." : "Join the\npride."}
          </h1>
          <p style={{
            fontFamily: T.font, fontSize: 18, color: "rgba(255,255,255,0.65)",
            margin: "0 0 48px", maxWidth: 360, lineHeight: 1.6,
          }}>
            {mode === "login"
              ? "Sign in to earn rewards, reorder your favorites, and skip the line."
              : "Create an account to start earning points on every order and unlock exclusive perks."}
          </p>

          <div style={{ display: "flex", gap: 32 }}>
            {[
              { n: "10K+", l: "Happy customers" },
              { n: "50K+", l: "Drinks served" },
              { n: "4.9", l: "Average rating" },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.white, margin: "0 0 2px", lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.caramel, margin: 0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 64px", background: T.cream,
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{
              fontFamily: T.font, fontSize: 11, fontWeight: 600,
              letterSpacing: "2px", textTransform: "uppercase", color: T.green,
              margin: "0 0 8px",
            }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </p>
            <h2 style={{
              fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700,
              color: T.darkBrew, margin: "0 0 8px", lineHeight: 1.15,
            }}>
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </h2>
            <p style={{ fontFamily: T.font, fontSize: 15, color: T.mocha, margin: 0, lineHeight: 1.5 }}>
              {mode === "login"
                ? "Enter your credentials below to continue."
                : "Fill in the details below to get started."}
            </p>
          </div>

          {error && (
            <div style={{
              background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: T.rSm,
              padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10,
            }}>
              <Ic name="x" size={16} color="#E53E3E" />
              <span style={{ fontFamily: T.font, fontSize: 14, color: "#C53030" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                    <Ic name="user" size={18} color={T.caramel} />
                  </div>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    style={{ ...inp, paddingLeft: 42 }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Email Address</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <Ic name="mail" size={18} color={T.caramel} />
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{ ...inp, paddingLeft: 42 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <Ic name="lock" size={18} color={T.caramel} />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  style={{ ...inp, paddingLeft: 42, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
                  }}
                >
                  <Ic name={showPw ? "eyeoff" : "eye"} size={18} color={T.caramel} />
                </button>
              </div>
              {mode === "login" && (
                <button type="button" style={{
                  background: "none", border: "none", fontFamily: T.font,
                  fontSize: 13, color: T.green, fontWeight: 600, cursor: "pointer",
                  padding: 0, marginTop: 8,
                }}>
                  Forgot password?
                </button>
              )}
            </div>

            {mode === "login" && (
              <div style={{
                background: T.white, border: `1px solid ${T.sand}`, borderRadius: T.rSm,
                padding: "14px 16px", marginBottom: 24,
              }}>
                <p style={{ fontFamily: T.font, fontSize: 12, color: T.mocha, margin: "0 0 4px", fontWeight: 600 }}>
                  Demo credentials
                </p>
                <p style={{ fontFamily: T.font, fontSize: 13, color: T.espresso, margin: 0 }}>
                  Email: <strong>bob@email.com</strong> &nbsp;·&nbsp; Password: <strong>password123</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cl-btn-primary cl-focus-ring"
              style={{
                ...btnP, width: "100%", padding: "16px 28px", fontSize: 16,
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: T.white, borderRadius: "50%", animation: "clSpin 0.6s linear infinite" }} />
              ) : null}
              {loading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <p style={{
            fontFamily: T.font, fontSize: 15, color: T.mocha,
            margin: "28px 0 0", textAlign: "center",
          }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              style={{
                background: "none", border: "none", fontFamily: T.font,
                fontSize: 15, color: T.green, fontWeight: 600, cursor: "pointer",
                padding: 0, textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes clSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
