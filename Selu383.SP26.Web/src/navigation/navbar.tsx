import { T, LOGO } from "../styles/tokens";
import { Ic } from "../components/icons";
import { useAppContext } from "../contexts/app-context";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES, isActiveRoute } from "./routes";

const navItems = [
  { route: APP_ROUTES.home, label: "Home" },
  { route: APP_ROUTES.menu, label: "Menu" },
  { route: APP_ROUTES.orders, label: "Order" },
  { route: APP_ROUTES.reservations, label: "Reservations" },
] as const;

export function Navbar({ cartCount }: { cartCount: number }) {
  const { isLoggedIn, user } = useAppContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initials = user.name.charAt(0).toUpperCase();

  return (
    <header className="topnav-root">
      <div className="topnav-inner">
        <button
          onClick={() => navigate(APP_ROUTES.home)}
          className="topnav-brand"
        >
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
              key={n.route}
              onClick={() => navigate(n.route)}
              className={`cl-nav-link focus-ring topnav-nav-item ${isActiveRoute(pathname, n.route) ? "topnav-nav-item-active" : "topnav-nav-item-idle"}`}
            >
              {n.label}
              {isActiveRoute(pathname, n.route) && (
                <span className="topnav-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="topnav-actions">
          <button
            onClick={() => navigate(APP_ROUTES.cart)}
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
              onClick={() => navigate(APP_ROUTES.profile)}
              className={`cl-focus-ring topnav-profile ${isActiveRoute(pathname, APP_ROUTES.profile) ? "topnav-profile-active" : ""}`}
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
              onClick={() => navigate(APP_ROUTES.auth)}
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
