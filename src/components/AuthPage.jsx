import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../context/useAuth';

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

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
    if (isAuthenticated) {
      navigate('/properties', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }

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
            <p className="login-minimal-eyebrow">Private access</p>
            <h1>Reva</h1>
            <p className="login-minimal-tagline">Hospitality operations, refined.</p>
          </div>

          <form className="login-minimal-card" onSubmit={handleSubmit}>
            <div className="login-minimal-header">
              <p className="login-card-kicker">Portfolio access</p>
              <h2>{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>
              <p>
                {mode === 'signup'
                  ? 'Create your access and enter the hospitality portfolio dashboard.'
                  : 'Access your hospitality portfolio dashboard.'}
              </p>
            </div>

            <div className="login-form-grid">
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email"
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
                {loading
                  ? 'Please wait...'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Enter portfolio'}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'));
                  setError('');
                }}
              >
                {mode === 'signup' ? 'I already have an account' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}