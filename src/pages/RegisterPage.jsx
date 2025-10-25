import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    if (emailRef.current) emailRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
  };

  useEffect(() => {
    clearForm();
    const timeout = setTimeout(clearForm, 100); // ensures clearing after autofill
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const success = await register(email, password);
      if (success) {
        clearForm();
        navigate('/app'); // redirect after registration
      } else {
        setError('Error registering user. Email may already exist.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to Airtable.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          ref={emailRef}
          placeholder="Email"
          value={email}
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          ref={passwordRef}
          placeholder="Password"
          type="password"
          value={password}
          autoComplete="off"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
}
