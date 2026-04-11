import { useState } from "react";
import { T, LOGO } from "../../styles/tokens";
import { Ic } from "../../components/icons";
import { useAppContext } from "../../contexts/app-context";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes";

export function AuthPage() {
  const { login, signup } = useAppContext();
  const navigate = useNavigate();
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
      if (result.ok) navigate(APP_ROUTES.home);
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
    <div className="auth-page">
      <div className="auth-hero">
        <ImageWithFallback
          src={T.heroImg}
          alt="Coffee shop ambiance"
          className="auth-hero-image"
        />
        <div className="auth-hero-overlay" />
        <div className="noise-overlay" />

        <div className="auth-hero-content">
          <img src={LOGO} alt="" className="auth-hero-logo" />
          <h1 className="auth-hero-title">
            {mode === "login" ? "Welcome\nback." : "Join the\npride."}
          </h1>
          <p className="auth-hero-subtitle">
            {mode === "login"
              ? "Sign in to earn rewards, reorder your favorites, and skip the line."
              : "Create an account to start earning points on every order and unlock exclusive perks."}
          </p>

          <div className="auth-stats">
            {[
              { n: "10K+", l: "Happy customers" },
              { n: "50K+", l: "Drinks served" },
              { n: "4.9", l: "Average rating" },
            ].map((s) => (
              <div key={s.l}>
                <p className="auth-stat-number">{s.n}</p>
                <p className="auth-stat-label">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-pane">
        <div className="auth-form-shell">
          <div className="auth-form-header">
            <p className="auth-kicker">
              {mode === "login" ? "Sign In" : "Create Account"}
            </p>
            <h2 className="auth-heading">
              {mode === "login"
                ? "Sign in to your account"
                : "Create your account"}
            </h2>
            <p className="auth-copy">
              {mode === "login"
                ? "Enter your credentials below to continue."
                : "Fill in the details below to get started."}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <Ic name="x" size={16} color="#E53E3E" />
              <span className="auth-error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field-block">
                <label className="label-base">Full Name</label>
                <div className="auth-input-wrap">
                  <div className="auth-input-icon">
                    <Ic name="user" size={18} color={T.caramel} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-base auth-input-with-left-icon"
                  />
                </div>
              </div>
            )}

            <div className="auth-field-block">
              <label className="label-base">Email Address</label>
              <div className="auth-input-wrap">
                <div className="auth-input-icon">
                  <Ic name="mail" size={18} color={T.caramel} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-base auth-input-with-left-icon"
                />
              </div>
            </div>

            <div className="auth-password-block">
              <label className="label-base">Password</label>
              <div className="auth-input-wrap">
                <div className="auth-input-icon">
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
                  className="input-base auth-input-with-both-icons"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="auth-eye-button"
                >
                  <Ic
                    name={showPw ? "eyeoff" : "eye"}
                    size={18}
                    color={T.caramel}
                  />
                </button>
              </div>
              {mode === "login" && (
                <button type="button" className="auth-forgot-button">
                  Forgot password?
                </button>
              )}
            </div>

            {mode === "login" && (
              <div className="auth-demo-box">
                <p className="auth-demo-title">Demo credentials</p>
                <p className="auth-demo-copy">
                  Email: <strong>bob@email.com</strong> &nbsp;·&nbsp; Password:{" "}
                  <strong>password123</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`cl-btn-primary focus-ring btn-primary-base auth-submit ${loading ? "auth-submit-loading" : ""}`}
            >
              {loading ? <span className="auth-spinner" /> : null}
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="auth-switch-copy">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button onClick={switchMode} className="auth-switch-button">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
