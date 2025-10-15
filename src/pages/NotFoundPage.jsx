import { useNavigate } from 'react-router-dom';

export default function NotFoundPage({ isPrivate = false }) {
  const navigate = useNavigate();

  function handleNavigate() {
    if (isPrivate) {
      // Send private users to their dashboard (or main page)
      navigate('/app/dashboard');
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
        {isPrivate ? 'Go to Dashboard' : 'Go to Login'}
      </button>
    </div>
  );
}
