import { useState } from "react";
import { Tokens, LOGO } from "../../styles/tokens";
import { Ic } from "../../components/icons";
import { useAppContext } from "../../api/context-providers/app-context";
import { ImageWithFallback } from "../../components/image-with-fallback";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../navigation/routes";
import "./auth.css";

export function AuthPage() {
  const { login, signup } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "login"
        ? await login(credential, password)
        : await signup(name, credential, password);

    if (!result.ok) setError(result.error || "Something went wrong.");
    if (result.ok) {
      const state = location.state as { from?: string } | null;
      const destination = state?.from ?? APP_ROUTES.orders;
      navigate(destination, { replace: true });
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setName("");
    setCredential("");
    setPassword("");
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <ImageWithFallback
          src={Tokens.heroImg}
          alt="Coffee shop ambiance"
          className="auth-hero-image"
        />
        <div className="auth-hero-overlay" />
        <div className="noise-overlay" />

        <div className="auth-hero-content">
          <img src={LOGO} alt="" className="auth-hero-logo" />
          <h1 className="auth-hero-title">
            {mode === "login" ? "Welcome back." : "Join the pride."}
          </h1>
          <p className="auth-hero-subtitle">
            {mode === "login"
              ? "Sign in to earn rewards, reorder your favorites, and skip the line."
              : "Create an account to start earning points on every order and unlock exclusive perks."}
          </p>
        </div>
      </div>

      <div className="auth-form-pane">
        <div className="auth-form-shell">
          <div>
            <h2 className="auth-heading">
              {mode === "login" ? "Sign in" : "Create your account"}
            </h2>
            <p className="auth-copy">
              {mode === "login"
                ? "Enter your credentials below to continue."
                : "Fill in the details below to get started."}
            </p>
            <br></br>
          </div>

          {error && (
            <div className="auth-error">
              <Ic name="x" size={16} color="#E53E3E" />
              <span className="auth-error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div>
                <label className="label-base">Full Name</label>
                <div className="auth-input-wrap">
                  <div className="auth-input-icon">
                    <Ic name="user" size={18} color={Tokens.caramel} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-base auth-input"
                  />
                </div>
                <br></br>
              </div>
            )}

            <div>
              <label className="label-base">
                {mode === "login" ? "Username" : "Email Address"}
              </label>
              <div className="auth-input-wrap">
                <div className="auth-input-icon">
                  <Ic name="mail" size={18} color={Tokens.caramel} />
                </div>
                <input
                  type={mode === "login" ? "text" : "email"}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={
                    mode === "login" ? "Your username" : "you@email.com"
                  }
                  autoComplete={mode === "login" ? "username" : "email"}
                  className="input-base auth-input"
                />
              </div>
              <br></br>
            </div>

            <div>
              <label className="label-base">Password</label>
              <div className="auth-input-wrap">
                <div className="auth-input-icon">
                  <Ic name="lock" size={18} color={Tokens.caramel} />
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
                  className="input-base auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="auth-eye-button"
                >
                  <Ic
                    name={showPw ? "eyeoff" : "eye"}
                    size={18}
                    color={Tokens.caramel}
                  />
                </button>
              </div>
              {mode === "login" && (
                <button type="button" className="auth-forgot-button">
                  Forgot password?
                </button>
              )}
            </div>
            <br></br>
            <br></br>
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
