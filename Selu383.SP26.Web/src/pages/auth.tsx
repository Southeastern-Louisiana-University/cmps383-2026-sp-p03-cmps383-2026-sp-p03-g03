import { useState } from "react";
import { T, LOGO } from "../components/tokens";
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
      const result =
        mode === "login"
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
    <div className="cl-auth-page">
      <div className="cl-auth-hero">
        <ImageWithFallback
          src={T.heroImg}
          alt="Coffee shop ambiance"
          className="cl-auth-hero-image"
        />
        <div className="cl-auth-hero-overlay" />
        <div className="cl-noise-overlay" />

        <div className="cl-auth-hero-content">
          <img src={LOGO} alt="" className="cl-auth-hero-logo" />
          <h1 className="cl-auth-hero-title">
            {mode === "login" ? "Welcome\nback." : "Join the\npride."}
          </h1>
          <p className="cl-auth-hero-subtitle">
            {mode === "login"
              ? "Sign in to earn rewards, reorder your favorites, and skip the line."
              : "Create an account to start earning points on every order and unlock exclusive perks."}
          </p>

          <div className="cl-auth-stats">
            {[
              { n: "10K+", l: "Happy customers" },
              { n: "50K+", l: "Drinks served" },
              { n: "4.9", l: "Average rating" },
            ].map((s) => (
              <div key={s.l}>
                <p className="cl-auth-stat-number">{s.n}</p>
                <p className="cl-auth-stat-label">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cl-auth-form-pane">
        <div className="cl-auth-form-shell">
          <div className="cl-auth-form-header">
            <p className="cl-auth-kicker">
              {mode === "login" ? "Sign In" : "Create Account"}
            </p>
            <h2 className="cl-auth-heading">
              {mode === "login"
                ? "Sign in to your account"
                : "Create your account"}
            </h2>
            <p className="cl-auth-copy">
              {mode === "login"
                ? "Enter your credentials below to continue."
                : "Fill in the details below to get started."}
            </p>
          </div>

          {error && (
            <div className="cl-auth-error">
              <Ic name="x" size={16} color="#E53E3E" />
              <span className="cl-auth-error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="cl-auth-field-block">
                <label className="cl-label-base">Full Name</label>
                <div className="cl-auth-input-wrap">
                  <div className="cl-auth-input-icon">
                    <Ic name="user" size={18} color={T.caramel} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="cl-input-base cl-auth-input-with-left-icon"
                  />
                </div>
              </div>
            )}

            <div className="cl-auth-field-block">
              <label className="cl-label-base">Email Address</label>
              <div className="cl-auth-input-wrap">
                <div className="cl-auth-input-icon">
                  <Ic name="mail" size={18} color={T.caramel} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="cl-input-base cl-auth-input-with-left-icon"
                />
              </div>
            </div>

            <div className="cl-auth-password-block">
              <label className="cl-label-base">Password</label>
              <div className="cl-auth-input-wrap">
                <div className="cl-auth-input-icon">
                  <Ic name="lock" size={18} color={T.caramel} />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signup"
                      ? "At least 6 characters"
                      : "Your password"
                  }
                  className="cl-input-base cl-auth-input-with-both-icons"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="cl-auth-eye-button"
                >
                  <Ic
                    name={showPw ? "eyeoff" : "eye"}
                    size={18}
                    color={T.caramel}
                  />
                </button>
              </div>
              {mode === "login" && (
                <button type="button" className="cl-auth-forgot-button">
                  Forgot password?
                </button>
              )}
            </div>

            {mode === "login" && (
              <div className="cl-auth-demo-box">
                <p className="cl-auth-demo-title">Demo credentials</p>
                <p className="cl-auth-demo-copy">
                  Email: <strong>bob@email.com</strong> &nbsp;·&nbsp; Password:{" "}
                  <strong>password123</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`cl-btn-primary cl-focus-ring cl-btn-primary-base cl-auth-submit ${loading ? "cl-auth-submit-loading" : ""}`}
            >
              {loading ? <span className="cl-auth-spinner" /> : null}
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="cl-auth-switch-copy">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button onClick={switchMode} className="cl-auth-switch-button">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
