import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('currentUser'); // detect login

  function handleNavigate() {
    if (isAuthenticated) {
      // Send private users to their dashboard (or main page)
      navigate('/app');
    } else {
      // Public users go to login page
      navigate('/login');
    }
  }

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <button onClick={handleNavigate}>
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
      </button>
    </div>
  );
}
