import { Tokens, LOGO } from "../styles/tokens";
import { Ic } from "../components/icons";
import { useAppContext } from "../api/context-providers/app-context";
import { useLocations } from "../api/locations";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES, isActiveRoute } from "./routes";
import "./navbar.css";

const navItems = [
  { route: APP_ROUTES.home, label: "Home" },
  { route: APP_ROUTES.menu, label: "Menu" },
  { route: APP_ROUTES.orders, label: "Order" },
  { route: APP_ROUTES.reservations, label: "Reservations" },
] as const;

export function Navbar({ cartCount }: { cartCount: number }) {
  const { isLoggedIn, user, selectedLocation } = useAppContext();
  const { locations } = useLocations();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initials = user.name.charAt(0).toUpperCase();

  const selectedLocationName = selectedLocation
    ? locations.find((loc) => loc.id === selectedLocation)?.name ||
      "Unknown Location"
    : null;

  return (
    <header className="navbar">
      <div className="nav-container">
        <button onClick={() => navigate(APP_ROUTES.home)} className="nav-brand">
          <img src={LOGO} alt="Caffeinated Lions" className="nav-brand-logo" />
          <span className="nav-brand-text">Caffeinated Lions</span>
        </button>

        <nav className="navlink-container">
          {navItems.map((n) => (
            <button
              key={n.route}
              onClick={() => navigate(n.route)}
              className={`navlink focus-ring navlink-item ${isActiveRoute(pathname, n.route) ? "navlink-active" : "navlink-idle"}`}
            >
              {n.label}
              {isActiveRoute(pathname, n.route) && (
                <span className="navlink-indicator" />
              )}
            </button>
          ))}
        </nav>

        {selectedLocationName && (
          <button
            onClick={() => navigate(APP_ROUTES.orders)}
            className="nav-location focus-ring"
            title="Change location"
          >
            <Ic name="location" size={16} color={Tokens.mocha} />
            <span className="nav-location-name">{selectedLocationName}</span>
          </button>
        )}

        <div className="nav-actions">
          <button
            onClick={() => navigate(APP_ROUTES.cart)}
            className="focus-ring nav-cart"
          >
            <Ic name="cart" size={22} color={Tokens.darkBrew} />
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount}</span>
            )}
          </button>

          <div className="nav-divider" />

          {isLoggedIn ? (
            <button
              onClick={() => navigate(APP_ROUTES.profile)}
              className={`cl-focus-ring nav-profile ${isActiveRoute(pathname, APP_ROUTES.profile) ? "nav-profile-active" : ""}`}
            >
              <div className="nav-avatar">
                <span className="nav-avatar-initial">{initials}</span>
              </div>
              <div className="nav-user-meta">
                <p className="nav-user-name">{user.name}</p>
                <p className="nav-user-points">{user.points} pts</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate(APP_ROUTES.auth)}
              className="btn-primary focus-ring nav-signin"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
