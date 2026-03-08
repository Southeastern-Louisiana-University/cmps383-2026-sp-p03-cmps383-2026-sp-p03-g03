import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Menu from './components/Menu';
import Order from './components/Order';
import Locations from './components/Locations';
import Account from './components/Account';
import SignInModal from './components/SignInModal';
import type { UserInterface } from './Interfaces';

function App() {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { 
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/authentication/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch {
        setUser(null);
        localStorage.removeItem('user');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const response = await fetch('/api/authentication/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userName: username, password: password })
    });
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const handleLogout = async () => {
    const response = await fetch('/api/authentication/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (response.ok) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const openSignInModal = () => {
    setModalOpen(true);
  };

  const closeSignInModal = () => {
    setModalOpen(false);
  };
  

  return (
    <Router>
      <div>
        <NavBar user={user} onSignIn={openSignInModal} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/account" element={<Account user={user} />} />
        </Routes>
        {modalOpen && (
          <SignInModal onClose={closeSignInModal} onLogin={handleLogin} />
        )}
      </div>
    </Router>
  );
}

export default App;
