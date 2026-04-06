import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/useAuth';

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setHideSplash(true);
    }, 2100);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/properties', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });

      navigate('/properties', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not authenticate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {showSplash && (
        <div className={`splash-screen ${hideSplash ? 'splash-screen-hide' : ''}`}>
          <div className="splash-wordmark-wrap">
            <h1 className="splash-wordmark">REVA</h1>
          </div>
        </div>
      )}

      <div className={`login-minimal-shell ${showSplash ? 'login-minimal-shell-hidden' : 'login-minimal-shell-visible'}`}>
        <div className="login-background-glow login-background-glow-one"></div>
        <div className="login-background-glow login-background-glow-two"></div>

        <div className="login-minimal-layout login-minimal-layout-stacked">
          <div className="login-minimal-brand">
            <h1>Reva</h1>
              <p className="login-minimal-tagline">Operations dashboard.</p>
          </div>

          <form className="login-minimal-card" onSubmit={handleSubmit}>
            <div className="login-minimal-header">
              <h2>Admin log in</h2>
                <p>Sign in with your admin account.</p>
            </div>

            <div className="login-form-grid">
              <input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-feedback form-feedback-error">{error}</p>}

            <div className="login-action-row">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}