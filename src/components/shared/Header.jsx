import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('currentUser'));

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate('/')}>
        SpendWise
      </h1>

      {user && (
        <div className="user-menu" ref={menuRef}>
          <button
            className="user-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {user.email} ⌄
          </button>

          {menuOpen && (
            <Nav
              onClose={() => setMenuOpen(false)} // pass prop to close menu
              onLogout={handleLogout}
            />
          )}
        </div>
      )}
    </header>
  );
}
