import { Outlet } from 'react-router-dom';
import Layout from './Layout';

export default function PublicLayout() {
  return (
    <Layout>
      <Outlet />
      {/* Nested public routes will render here */}
    </Layout>
  );
}
