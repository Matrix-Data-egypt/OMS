import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthSection.css';

export default function AuthSection() {
  const navigate = useNavigate();
  const { loginCustomer, loading } = useAuth();

  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim())    return setErrorMessage('من فضلك أدخل البريد الإلكتروني.');
    if (!password.trim()) return setErrorMessage('من فضلك أدخل كلمة المرور.');

    const result = await loginCustomer(email.trim(), password.trim());

    if (result.ok) {
      setSuccessMsg(result.message || 'تم تسجيل الدخول بنجاح!');
      setTimeout(() => navigate('/'), 900);
    } else {
      setErrorMessage(result.message || 'فشل تسجيل الدخول. تحقق من بياناتك.');
    }
  };

  return (
    <main className="auth-page-wrapper">
      <div className="exact-auth-card">

        {/* Left Branding Panel */}
        <section className="exact-left-panel" aria-label="Branding Message">
          <div className="grid-overlay-blueprint" aria-hidden="true" />

          <div className="panel-content-wrapper">
            <span className="company-top-tag">OMS ADVERTISING</span>

            <div className="center-text-group animate-fade-in-up">
              <p className="welcome-sub">Nice to see you again</p>
              <h2 className="welcome-main">WELCOME BACK</h2>
              <div className="exact-accent-line" aria-hidden="true" />
              <p className="welcome-desc">
                Sign in to your OMS account to track your campaigns, manage briefs, and stay connected with our team.
              </p>
            </div>
          </div>

          <div className="geo-circle circle-top"    aria-hidden="true" />
          <div className="geo-circle circle-bottom" aria-hidden="true" />
        </section>

        {/* Right Form Panel */}
        <section className="exact-right-panel" aria-label="Login Form">
          <div className="exact-form-wrapper">

            <h1 className="exact-login-title">Login Account</h1>
            <p className="exact-login-subdesc">
              Enter your credentials to securely access your account.
            </p>

            {/* Error Banner */}
            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="auth-success-banner" role="status">
                <span>✅</span> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="exact-form-element" noValidate>

              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  autoComplete="email"
                  aria-label="Email Address"
                  disabled={loading}
                />
              </div>

              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar" aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-label="Password"
                  disabled={loading}
                />
              </div>

              <div className="exact-form-controls">
                <label className="exact-checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    aria-label="Keep me signed in"
                  />
                  <span>Keep me signed in</span>
                </label>
                <Link to="/signup" className="exact-member-link">
                  Create New Account?
                </Link>
              </div>

              <button
                type="submit"
                className="exact-login-submit-btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'جارٍ تسجيل الدخول…' : 'LOG IN'}
              </button>

            </form>
          </div>
        </section>

      </div>
    </main>
  );
}
