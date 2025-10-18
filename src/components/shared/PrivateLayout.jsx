import { Navigate, Outlet } from 'react-router-dom';
import Layout from './Layout';

export default function PrivateLayout() {
  const isAuthenticated = localStorage.getItem('currentUser');

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet /> {/* Nested private routes will render here */}
    </Layout>
  );
}
