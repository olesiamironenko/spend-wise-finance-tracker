import { createContext, useContext, useState, useEffect } from 'react';

import { mockUsers } from '../utils/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const allUsers = [...mockUsers, ...storedUsers];

    const foundUser = allUsers.find(
      (u) => u.email === email.trim() && u.password === password.trim()
    );

    if (foundUser) {
      localStorage.setItem('user', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = (email, password) => {
    // Save "registered" user (local storage)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const id = 'user_' + (users.length + mockUsers.length + 1);
    const newUser = { id, email, password, name: email.split('@')[0] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
