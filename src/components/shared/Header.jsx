import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

export default function Header() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('currentUser'));

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate('/')}>
        SpendWise
      </h1>

      {user && (
        <>
          <Nav /> {/* always visible navigation */}
          <div className="user-section">
            <span className="user-email">Welcome, {user.email}</span>
          </div>
        </>
      )}
    </header>
  );
}
