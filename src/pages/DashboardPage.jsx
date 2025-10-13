import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user?.email}</h2>
      <p>This is your dashboard. More finance features coming soon!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
