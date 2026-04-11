import { LOGO } from "../styles/tokens";
import { useAppContext } from "./app-context";

export function Footer() {
  const { isLoggedIn, setTab } = useAppContext();
  return (
    <footer className="footer-root">
      <div className="noise-overlay footer-noise" />

      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-row">
              <img
                src={LOGO}
                alt="Caffeinated Lions"
                className="footer-brand-logo"
              />
              <span className="footer-brand-text">Caffeinated Lions</span>
            </div>
            <p className="footer-brand-copy">
              Handcrafted drinks, crepes, and bagels. Pouring pride into every
              cup [since when?].
            </p>
            {/* <div className="footer-social-row">
              {["instagram", "twitter", "facebook"].map((s) => (
                <div key={s} className="footer-social-dot">
                  {s[0].toUpperCase()}
                </div>
              ))}
            </div> */}
          </div>

          <div>
            <h4 className="footer-col-title">Menu</h4>
            {[
              { l: "Drinks", k: "order" },
              { l: "Sweet Crepes", k: "order" },
              { l: "Savory Crepes", k: "order" },
              { l: "Bagels", k: "order" },
            ].map((item) => (
              <button
                key={item.l}
                onClick={() => setTab(item.k)}
                className="footer-link"
              >
                {item.l}
              </button>
            ))}
          </div>

          <div>
            <h4 className="footer-col-title">Account</h4>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setTab("profile")}
                  className="footer-link"
                >
                  My Profile
                </button>
                <button onClick={() => setTab("cart")} className="footer-link">
                  My Orders
                </button>
                <p className="footer-link footer-link-text">Rewards</p>
              </>
            ) : (
              <>
                <button onClick={() => setTab("auth")} className="footer-link">
                  Sign In
                </button>
                <button onClick={() => setTab("auth")} className="footer-link">
                  Create Account
                </button>
              </>
            )}
          </div>

          <div>
            <h4 className="footer-col-title">Visit Us</h4>
            <p className="footer-visit-copy">
              [replace with actual address]
              <br />
              [or at least one from the API]
            </p>
            <p className="footer-visit-copy footer-visit-copy-late">
              Mon–Sun: 6am – 6pm
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
