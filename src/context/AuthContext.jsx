import { createContext, useState, useEffect } from 'react';
import { createUser, findUserByEmailAndPassword } from '../utils/airtableUsers';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('currentUser')) || null
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    try {
      const airtableUser = await findUserByEmailAndPassword(email, password);
      if (!airtableUser) return false;

      const loggedUser = {
        id: airtableUser.id,
        userId: airtableUser.userId,
        email: airtableUser.email,
        password: airtableUser.password,
      };

      setUser(loggedUser);
      return true;
    } catch (err) {
      console.error('Error logging in via Airtable:', err);
      return false;
    }
  };

  // Logout
  const logout = () => setUser(null);

  // Register
  const register = async (email, password) => {
    try {
      const airtableUser = await createUser(email, password);

      const newUser = {
        id: airtableUser.id,
        userId: airtableUser.userId,
        email: airtableUser.email,
        password: airtableUser.password,
      };

      setUser(newUser);
      return true;
    } catch (err) {
      console.error('Airtable registration failed:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
