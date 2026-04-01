import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);
  const [email, setEmail] = useState('admin@aureline.com');
  const [password, setPassword] = useState('••••••••');
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/properties');
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
              <p className="login-card-kicker">Portfolio login</p>
              <h2>Sign in</h2>
              <p>Access your hospitality portfolio dashboard.</p>
            </div>

            <div className="login-form-grid">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-action-row">
              <button className="primary-button" type="submit">
                Enter portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}