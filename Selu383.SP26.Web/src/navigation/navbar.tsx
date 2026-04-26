import { useEffect, useState } from "react";
import { Tokens, LOGO } from "../styles/tokens";
import { Ic } from "../components/icons";
import { useAppContext } from "../api/context-providers/app-context";
import { useLocations } from "../api/locations";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES, isActiveRoute, homeRouteForRoles } from "./routes";
import "./navbar.css";

const navItems = [
  { route: APP_ROUTES.home, label: "Home" },
  { route: APP_ROUTES.menu, label: "Menu" },
  { route: APP_ROUTES.orders, label: "Order" },
  { route: APP_ROUTES.reservations, label: "Reservations" },
] as const;

export function Navbar({ cartCount }: { cartCount: number }) {
  const {
    isLoggedIn,
    user,
    selectedLocation,
    setSelectedLocation,
    handleLocationChange,
  } = useAppContext();
  const { locations } = useLocations();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initials = user.name.charAt(0).toUpperCase();
  const [searchQuery, setSearchQuery] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLocationName = selectedLocation
    ? locations.find((loc) => loc.id === selectedLocation)?.name ||
      "Unknown Location"
    : null;

  useEffect(() => {
    setSearchQuery(selectedLocationName ?? "");
  }, [selectedLocationName]);

  const filteredLocations = locations
    .filter((location) =>
      searchQuery.trim().length === 0
        ? true
        : location.name
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
    )
    .slice(0, 3);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDropdownOpen(true);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery("");
  };

  const handleLocationSelect = (locationId: number, locationName: string) => {
    setSearchQuery(locationName);
    setDropdownOpen(false);
    handleLocationChange(locationId);
  };

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

        <div
          className="nav-location-picker"
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
        >
          <Ic name="mappin" size={16} color={Tokens.mocha} />
          <div className="nav-location-input-wrap">
            <input
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search locations"
              className="input-base nav-location-input"
              aria-label="Search locations"
            />
            <button
              type="button"
              onClick={clearLocation}
              className="nav-location-clear"
              aria-label="Clear location"
            >
              <Ic name="x" size={16} color={Tokens.mocha} />
            </button>
            <span className="nav-location-arrow" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={Tokens.mocha}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
            {dropdownOpen && filteredLocations.length > 0 && (
              <div className="nav-location-dropdown">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      handleLocationSelect(location.id, location.name)
                    }
                    className="nav-location-option"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions">
          {!isStaffSide && (
            <button
              onClick={() => navigate(APP_ROUTES.cart)}
              className="focus-ring nav-cart"
            >
              <Ic name="cart" size={22} color={Tokens.darkBrew} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </button>
          )}

          {isLoggedIn &&
            user.roles.some((r) =>
              ["Staff", "Manager", "Admin"].includes(r),
            ) && (
              <button
                onClick={() => navigate(homeRouteForRoles(user.roles))}
                className="focus-ring nav-staff-link"
              >
                Staff Panel
              </button>
            )}

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
                {!isStaffSide && (
                  <p className="nav-user-points">{user.points} pts</p>
                )}
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
