import { useState } from "react";

interface SignInModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

function SignInModal({ onClose, onLogin }: SignInModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onLogin(username, password);
    onClose();
  };

  return (
    <div className="signin-modal-overlay">
      <div
        className="signin-modal card"
        style={{
          width: "15rem",
          height: "10rem",
          padding: "1.5rem",
          marginRight: "-3rem",
        }}
      >
        <h2 style={{ textAlign: "left", marginBottom: "-.5rem" }}>Sign In</h2>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="signin-input"
            style={{
              marginBottom: ".5rem",
              width: "100%",
              height: "1.5rem",
              backgroundColor: "rgb(228, 255, 190)",
              fontSize: "90%",
            }}
          />
          <br></br>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signin-input"
            style={{
              marginBottom: "1rem",
              width: "100%",
              height: "1.5rem",
              backgroundColor: "rgb(228, 255, 190)",
              fontSize: "90%",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <button
              type="submit"
              className="green-hover-effect"
              style={{
                backgroundColor: "--brand-color",
                fontSize: "90%",
                fontFamily: "inherit",
                borderRadius: "5%",
              }}
            >
              Login
            </button>
            <button
              type="button"
              className="green-hover-effect"
              onClick={onClose}
              style={{
                fontSize: "90%",
                fontFamily: "inherit",
                borderRadius: "5%",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInModal;
