import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserInterface } from '../Interfaces';

interface NavBarProps {
  user: UserInterface | null;
  onSignIn: () => void;
  onLogout: () => void;
}

function NavBar({ user, onSignIn, onLogout }: NavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/menu" className="nav-link">Menu</Link>
        <Link to="/order" className="nav-link">Order</Link>
        <Link to="/locations" className="nav-link">Locations</Link>
      </div>
      <div className="account-dropdown">
        <button className="account-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          Account
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            {user ? (
              <>
                <Link to="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Account Info
                </Link>
                <button className="dropdown-item" onClick={() => { onLogout(); setDropdownOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <button className="dropdown-item" onClick={() => { onSignIn(); setDropdownOpen(false); }}>
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;