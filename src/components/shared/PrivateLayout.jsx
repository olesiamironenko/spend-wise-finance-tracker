import { Navigate } from 'react-router-dom';
import Layout from './Layout';

export default function PrivateLayout({ children }) {
  const isAuthenticated = localStorage.getItem('user'); // or useContext(AuthContext)

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}
