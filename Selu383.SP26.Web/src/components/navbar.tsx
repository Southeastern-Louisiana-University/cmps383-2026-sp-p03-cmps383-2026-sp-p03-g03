import { T, LOGO } from "../styles/tokens";
import { Ic } from "./icons";
import { useAppContext } from "./app-context";

const navItems = [
  { k: "home", l: "Home" },
  { k: "order", l: "Menu" },
  { k: "orders", l: "Order" },
  { k: "reserve", l: "Reservations" },
] as const;

export function Navbar({ cartCount }: { cartCount: number }) {
  const { isLoggedIn, setTab, tab, user } = useAppContext();
  const initials = user.name.charAt(0).toUpperCase();

  return (
    <header className="topnav-root">
      <div className="topnav-inner">
        <button onClick={() => setTab("home")} className="topnav-brand">
          <img
            src={LOGO}
            alt="Caffeinated Lions"
            className="topnav-brand-logo"
          />
          <span className="topnav-brand-text">Caffeinated Lions</span>
        </button>

        <nav className="topnav-nav">
          {navItems.map((n) => (
            <button
              key={n.k}
              onClick={() => setTab(n.k)}
              className={`cl-nav-link focus-ring topnav-nav-item ${tab === n.k ? "topnav-nav-item-active" : "topnav-nav-item-idle"}`}
            >
              {n.l}
              {tab === n.k && <span className="topnav-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="topnav-actions">
          <button
            onClick={() => setTab("cart")}
            className="focus-ring topnav-cart"
          >
            <Ic name="cart" size={22} color={T.darkBrew} />
            {cartCount > 0 && (
              <span className="topnav-cart-badge">{cartCount}</span>
            )}
          </button>

          <div className="topnav-divider" />

          {isLoggedIn ? (
            <button
              onClick={() => setTab("profile")}
              className={`cl-focus-ring topnav-profile ${tab === "profile" ? "topnav-profile-active" : ""}`}
            >
              <div className="topnav-avatar">
                <span className="topnav-avatar-initial">{initials}</span>
              </div>
              <div className="topnav-user-meta">
                <p className="topnav-user-name">{user.name}</p>
                <p className="topnav-user-points">{user.points} pts</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setTab("auth")}
              className="btn-primary focus-ring topnav-signin"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
