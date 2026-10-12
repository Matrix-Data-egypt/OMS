import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthSection.css'; 

export default function AuthSection({ setUser }) {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(''); // Clear errors when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Premium Validation (No native browser alerts)
    if (!email.trim()) {
      return setErrorMessage('Please enter your Email ID.');
    }
    if (!password.trim()) {
      return setErrorMessage('Please enter your Password.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const userNameRaw = trimmedEmail.split('@')[0]; 
    const userNameFormatted = userNameRaw.toUpperCase(); 
    
    // Determine user authorization tier
    const userRole = trimmedEmail === 'admin@omsadvertising.com' ? 'admin' : 'user';

    setUser({
      name: userNameFormatted,
      role: userRole
    }); 

    navigate('/'); 
  };

  return (
    <main className="auth-page-wrapper">
      <div className="exact-auth-card">
        
        {/* Left Informational Branding Panel */}
        <section className="exact-left-panel" aria-label="Branding Message">
          <div className="grid-overlay-blueprint" aria-hidden="true" />
          
          <div className="panel-content-wrapper">
            <span className="company-top-tag">OMS ADVERTISING</span>
            
            <div className="center-text-group animate-fade-in-up">
              <p className="welcome-sub">Nice to see you again</p>
              <h2 className="welcome-main">WELCOME BACK</h2>
              <div className="exact-accent-line" aria-hidden="true" />
              <p className="welcome-desc">
                Join our corporate environment. Deploy your industrial dashboards, manage briefs, and access your exclusive panels.
              </p>
            </div>
          </div>
          
          <div className="geo-circle circle-top" aria-hidden="true" />
          <div className="geo-circle circle-bottom" aria-hidden="true" />
        </section>

        {/* Right Secure Interactive Form Panel */}
        <section className="exact-right-panel" aria-label="Secure Authentication Form">
          <div className="exact-form-wrapper">
            
            <h1 className="exact-login-title">Login Account</h1>
            <p className="exact-login-subdesc">Enter your credentials below to securely enter your dashboard workspace.</p>

            {/* Accessible Inline Error Message */}
            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="exact-form-element">
              
              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar" aria-hidden="true" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email ID" 
                  autoComplete="email"
                  aria-label="Email Address"
                />
              </div>

              <div className="exact-input-box-group">
                <div className="exact-vertical-color-bar" aria-hidden="true" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password" 
                  autoComplete="current-password"
                  aria-label="Password"
                />
              </div>

              <div className="exact-form-controls">
                <label className="exact-checkbox-label">
                  <input type="checkbox" defaultChecked /> 
                  <span>Keep me signed in</span>
                </label>
                <Link to="/signup" className="exact-member-link">
                  Create New Account?
                </Link>
              </div>

              <button type="submit" className="exact-login-submit-btn">
                LOG IN
              </button>

            </form>

          </div>
        </section>

      </div>
    </main>
  );
}
