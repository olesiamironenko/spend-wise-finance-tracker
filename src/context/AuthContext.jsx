import { createContext, useState, useEffect } from 'react';
import { findUserByEmailAndPassword } from '../utils/airtableAuth';
import { createUser } from '../utils/airtableUsers';
import { mockUsers } from '../utils/mockData';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Login: check mock data first, then Airtable
  const login = async (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const allUsers = [...mockUsers, ...storedUsers];

    // Check local mock users
    let foundUser = allUsers.find(
      (u) => u.email === email.trim() && u.password === password.trim()
    );

    if (foundUser) {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }

    // Check Airtable
    try {
      const airtableUser = await findUserByEmailAndPassword(email, password);
      if (airtableUser) {
        localStorage.setItem('currentUser', JSON.stringify(airtableUser));
        setUser(airtableUser);
        return true;
      }
    } catch (err) {
      console.error('Error connecting to Airtable:', err);
    }

    return false; // not found
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // Register: save locally and to Airtable
  const register = async (email, password) => {
    // Local storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const id = 'user_' + (users.length + mockUsers.length + 1);
    const newUser = { id, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Airtable
    try {
      await createUser(email, password);
    } catch (error) {
      console.warn(
        'Airtable registration failed (mock user still created)',
        error
      );
    }

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
