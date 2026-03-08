import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { UserInterface } from "../Interfaces";

interface NavBarProps {
  user: UserInterface | null;
  onSignIn: () => void;
  onLogout: () => void;
}

function NavBar({ user, onSignIn, onLogout }: NavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");

  useEffect(() => {
    if (user) {
      setUserInitials(
        `${user.firstName?.charAt(0) || "?"}${user.lastName?.charAt(0) || "?"}`,
      );
    }
  }, [setUserInitials, user]);

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <img
            src="/src/assets/ConceptLogo1.svg"
            alt="Caffeinated Lions Logo"
          />
        </Link>
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/menu" className="nav-link">
          Menu
        </Link>
        <Link to="/order" className="nav-link">
          Order
        </Link>
        <Link to="/locations" className="nav-link">
          Locations
        </Link>
      </div>
      <div>
        {user ? (
          <button
            className="account-initials"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {userInitials}
          </button>
        ) : (
          <button
            className="account-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Account
          </button>
        )}
        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="menu-backdrop"
              onClick={() => setDropdownOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
              }}
            />

            {/* Menu */}
            <div className="dropdown-menu card" style={{ zIndex: 11 }}>
              {user ? (
                <>
                  <Link
                    to="/account"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Account Info
                  </Link>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onSignIn();
                    setDropdownOpen(false);
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
